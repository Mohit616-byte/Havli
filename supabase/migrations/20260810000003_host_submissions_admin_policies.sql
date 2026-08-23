-- Migration: Add Admin RLS policies for host_submissions and events management

-- Allow reading host submissions for admin review
CREATE POLICY "host_submissions_select_all"
  ON public.host_submissions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow updating host submission status (approve/reject)
CREATE POLICY "host_submissions_update_all"
  ON public.host_submissions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow inserting approved events into events table
CREATE POLICY "events_insert_all"
  ON public.events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
