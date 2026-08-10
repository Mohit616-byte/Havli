-- ============================================================
-- HAVLI — Initial Schema Migration
-- Phase 3A: Database schema only
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- HELPER: updated_at trigger function
-- ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ──────────────────────────────────────────────────────────
-- TABLE: profiles
-- One row per auth user. Created on sign-up via trigger.
-- ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  phone       TEXT,
  email       TEXT,
  city        TEXT,
  area        TEXT,
  age_range   TEXT,
  avatar_url  TEXT,
  interests   TEXT[]      DEFAULT '{}',
  role        TEXT        NOT NULL DEFAULT 'user',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT profiles_role_check CHECK (role IN ('user', 'host', 'admin'))
);

COMMENT ON TABLE public.profiles IS 'Public user profiles linked to auth.users.';
COMMENT ON COLUMN public.profiles.role IS 'user | host | admin — only admins may change this column.';
COMMENT ON COLUMN public.profiles.interests IS 'Array of vibe/category preferences e.g. {Music, Gaming}.';

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ──────────────────────────────────────────────────────────
-- TABLE: events
-- Approved events are publicly visible.
-- Exact residential addresses are NEVER stored here.
-- ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.events (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id        UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  title          TEXT        NOT NULL,
  description    TEXT,
  event_type     TEXT        NOT NULL,
  vibe           TEXT,
  city           TEXT        NOT NULL,
  area           TEXT        NOT NULL,   -- Approximate only: "Sector 57", "Golf Course Road"
  date           DATE        NOT NULL,
  start_time     TIME        NOT NULL,
  price          INTEGER     NOT NULL DEFAULT 0,
  capacity       INTEGER     NOT NULL,
  spots_left     INTEGER     NOT NULL,   -- Decremented on interest confirmation
  image_url      TEXT,
  what_to_expect TEXT,                   -- Stored as newline-separated text
  safety_note    TEXT,
  status         TEXT        NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT events_price_check    CHECK (price >= 0),
  CONSTRAINT events_capacity_check CHECK (capacity > 0),
  CONSTRAINT events_spots_check    CHECK (spots_left >= 0),
  CONSTRAINT events_status_check   CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed'))
);

COMMENT ON TABLE public.events IS 'Social events hosted on Havli. Only approved events are publicly visible.';
COMMENT ON COLUMN public.events.area IS 'Approximate public area only — never exact residential address.';
COMMENT ON COLUMN public.events.spots_left IS 'Managed by backend; decremented on confirmed attendance.';
COMMENT ON COLUMN public.events.what_to_expect IS 'Newline-separated bullet points.';

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ──────────────────────────────────────────────────────────
-- TABLE: event_interests
-- Records user interest in an event.
-- One user cannot express interest in the same event twice.
-- ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.event_interests (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT,
  phone       TEXT,
  age_range   TEXT,
  city        TEXT,
  area        TEXT,
  instagram   TEXT,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT event_interests_unique UNIQUE (event_id, user_id)
);

COMMENT ON TABLE public.event_interests IS 'User interest registrations for events. Enforces one-per-user-per-event via unique constraint.';


-- ──────────────────────────────────────────────────────────
-- TABLE: host_submissions
-- Hosts submit event proposals for admin review.
-- All new submissions default to pending.
-- ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.host_submissions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  phone        TEXT        NOT NULL,
  instagram    TEXT,
  event_title  TEXT        NOT NULL,
  event_type   TEXT        NOT NULL,
  city         TEXT        NOT NULL,
  area         TEXT        NOT NULL,
  date         DATE        NOT NULL,
  start_time   TIME        NOT NULL,
  capacity     INTEGER     NOT NULL,
  price        INTEGER     NOT NULL DEFAULT 0,
  vibe         TEXT,
  description  TEXT,
  image_url    TEXT,
  status       TEXT        NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT host_submissions_capacity_check CHECK (capacity > 0),
  CONSTRAINT host_submissions_price_check    CHECK (price >= 0),
  CONSTRAINT host_submissions_status_check   CHECK (status IN ('pending', 'approved', 'rejected'))
);

COMMENT ON TABLE public.host_submissions IS 'Host event proposals pending admin review. Never auto-approved.';

CREATE TRIGGER host_submissions_updated_at
  BEFORE UPDATE ON public.host_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ──────────────────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────────────────

-- events — most common query patterns
CREATE INDEX IF NOT EXISTS idx_events_city       ON public.events (city);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events (event_type);
CREATE INDEX IF NOT EXISTS idx_events_vibe       ON public.events (vibe);
CREATE INDEX IF NOT EXISTS idx_events_date       ON public.events (date);
CREATE INDEX IF NOT EXISTS idx_events_status     ON public.events (status);
CREATE INDEX IF NOT EXISTS idx_events_host_id    ON public.events (host_id);

-- event_interests — lookup by event and by user
CREATE INDEX IF NOT EXISTS idx_event_interests_event_id ON public.event_interests (event_id);
CREATE INDEX IF NOT EXISTS idx_event_interests_user_id  ON public.event_interests (user_id);

-- host_submissions — admin review queue
CREATE INDEX IF NOT EXISTS idx_host_submissions_status ON public.host_submissions (status);


-- ──────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_interests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_submissions  ENABLE ROW LEVEL SECURITY;


-- ─── profiles policies ────────────────────────────────────

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile — but NOT their role
-- Role changes are admin-only (enforced by the check below)
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );


-- ─── events policies ──────────────────────────────────────

-- Anyone (including anonymous) can read approved events
CREATE POLICY "events_select_approved_public"
  ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Authenticated hosts can see their own events (any status)
CREATE POLICY "events_select_own_host"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (host_id = auth.uid());

-- Hosts can insert new events — status is forced to 'pending' by DB default
-- Users cannot set status to anything other than 'pending' on insert
CREATE POLICY "events_insert_authenticated"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    host_id = auth.uid()
    AND status = 'pending'
  );

-- Hosts can update their own events ONLY when pending
-- They cannot approve, reject, or change status to anything privileged
CREATE POLICY "events_update_own_pending"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid() AND status = 'pending')
  WITH CHECK (
    host_id = auth.uid()
    AND status = 'pending'
  );


-- ─── event_interests policies ─────────────────────────────

-- Users can read their own interest records
CREATE POLICY "event_interests_select_own"
  ON public.event_interests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Authenticated users can register interest — must use their own user_id
CREATE POLICY "event_interests_insert_own"
  ON public.event_interests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can delete (withdraw) their own interest
CREATE POLICY "event_interests_delete_own"
  ON public.event_interests
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());


-- ─── host_submissions policies ────────────────────────────

-- Authenticated users can submit a host request
-- No user_id column here — submissions are linked by phone/name for now
-- Phase 3B will add a submitter_id column when auth is connected
CREATE POLICY "host_submissions_insert_authenticated"
  ON public.host_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (status = 'pending');

-- Anonymous submissions are allowed for Phase 2 compatibility
-- Remove this policy in Phase 3B when auth is required
CREATE POLICY "host_submissions_insert_anon"
  ON public.host_submissions
  FOR INSERT
  TO anon
  WITH CHECK (status = 'pending');
