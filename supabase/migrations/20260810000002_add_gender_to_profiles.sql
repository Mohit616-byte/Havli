-- Migration: Add gender column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS gender TEXT;

COMMENT ON COLUMN public.profiles.gender IS 'Optional gender preference: Male | Female | Other | Prefer not to say';
