-- Add photo_urls array column to reviews
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT NULL;
