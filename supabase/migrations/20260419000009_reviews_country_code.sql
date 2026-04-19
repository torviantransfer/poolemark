-- Add country_code column to reviews
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT NULL;
