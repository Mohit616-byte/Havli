-- ============================================================
-- HAVLI — Phase 5: Bookings
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- TABLE: bookings
-- Tracks confirmed and cancelled event bookings.
-- Payment is test-only in Phase 5; Razorpay replaces
-- payment_status='test_paid' in Phase 6.
-- ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bookings (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       UUID        NOT NULL REFERENCES public.events(id)   ON DELETE CASCADE,
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount         INTEGER     NOT NULL,
  status         TEXT        NOT NULL DEFAULT 'confirmed',
  payment_status TEXT        NOT NULL DEFAULT 'test_paid',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT bookings_status_check         CHECK (status         IN ('confirmed', 'cancelled', 'refunded')),
  CONSTRAINT bookings_payment_status_check CHECK (payment_status IN ('test_paid', 'pending', 'failed', 'refunded')),
  CONSTRAINT bookings_amount_check         CHECK (amount >= 0)
);

COMMENT ON TABLE public.bookings IS 'Event bookings. One confirmed booking per user per event. Cancelled bookings allow rebooking.';
COMMENT ON COLUMN public.bookings.amount IS 'Snapshot of events.price at booking time. Price changes later do not affect this.';
COMMENT ON COLUMN public.bookings.payment_status IS 'test_paid = Phase 5 demo. Will be replaced by Razorpay verification in Phase 6.';

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ──────────────────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────────────────

-- Partial unique index: one CONFIRMED booking per user per event.
-- Cancelled bookings do NOT count, allowing rebooking after cancellation.
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_unique_confirmed
  ON public.bookings (event_id, user_id)
  WHERE (status = 'confirmed');

CREATE INDEX IF NOT EXISTS idx_bookings_event_id       ON public.bookings (event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id        ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status         ON public.bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings (payment_status);


-- ──────────────────────────────────────────────────────────
-- ATOMIC BOOKING FUNCTION
--
-- Uses FOR UPDATE to lock the event row, then re-counts
-- confirmed bookings, checks capacity, and inserts atomically.
-- Prevents overbooking under concurrent requests.
--
-- Returns:
--   'OK:<booking_id>'   on success
--   'SOLD_OUT'          when capacity is full
--   'DUPLICATE'         when user already has a confirmed booking
--   'EVENT_NOT_FOUND'   when event doesn't exist or isn't approved
-- ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.reserve_booking(
  p_event_id  UUID,
  p_user_id   UUID,
  p_amount    INTEGER
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_capacity   INTEGER;
  v_evt_status TEXT;
  v_booked     INTEGER;
  v_booking_id UUID;
BEGIN
  -- Lock the event row to serialize concurrent booking attempts
  SELECT capacity, status
  INTO   v_capacity, v_evt_status
  FROM   public.events
  WHERE  id = p_event_id
  FOR    UPDATE;

  -- Event must exist and be approved
  IF NOT FOUND THEN
    RETURN 'EVENT_NOT_FOUND';
  END IF;

  IF v_evt_status <> 'approved' THEN
    RETURN 'EVENT_NOT_FOUND';
  END IF;

  -- Check for existing confirmed booking
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE event_id = p_event_id
      AND user_id  = p_user_id
      AND status   = 'confirmed'
  ) THEN
    RETURN 'DUPLICATE';
  END IF;

  -- Count current confirmed bookings
  SELECT COUNT(*)
  INTO   v_booked
  FROM   public.bookings
  WHERE  event_id = p_event_id
    AND  status   = 'confirmed';

  -- Check capacity
  IF v_booked >= v_capacity THEN
    RETURN 'SOLD_OUT';
  END IF;

  -- Insert the booking atomically
  INSERT INTO public.bookings (event_id, user_id, amount, status, payment_status)
  VALUES (p_event_id, p_user_id, p_amount, 'confirmed', 'test_paid')
  RETURNING id INTO v_booking_id;

  RETURN 'OK:' || v_booking_id::TEXT;
END;
$$;

COMMENT ON FUNCTION public.reserve_booking IS
  'Atomically reserves a booking using FOR UPDATE on the event row. '
  'Returns OK:<uuid>, SOLD_OUT, DUPLICATE, or EVENT_NOT_FOUND.';


-- ──────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can read only their own bookings
CREATE POLICY "bookings_select_own"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Hosts can read bookings for events they own
CREATE POLICY "bookings_host_select"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM public.events WHERE host_id = auth.uid()
    )
  );

-- Users can update (cancel) only their own bookings
CREATE POLICY "bookings_update_own"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins have full access
CREATE POLICY "bookings_admin_all"
  ON public.bookings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
