-- ============================================================
-- HAVLI — Migration: Add user_id and host_id to host_submissions
-- Phase 3B: Connect submissions to auth users
-- ============================================================

-- Add submitter identity columns so submissions can be linked back to profiles.
-- user_id and host_id are intentionally nullable to keep backwards compatibility
-- with any existing anonymous rows (Phase 2 legacy data).

ALTER TABLE public.host_submissions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Index for fast lookup of a user's own submissions
CREATE INDEX IF NOT EXISTS idx_host_submissions_user_id ON public.host_submissions (user_id);
CREATE INDEX IF NOT EXISTS idx_host_submissions_host_id ON public.host_submissions (host_id);

-- Allow authenticated users to read their own submissions (for "My Submissions" dashboard)
CREATE POLICY "host_submissions_select_own"
  ON public.host_submissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR host_id = auth.uid());
