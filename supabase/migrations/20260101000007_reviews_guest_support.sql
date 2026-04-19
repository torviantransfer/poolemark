-- Add guest review support columns
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS is_verified_purchase boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reviewer_name text,
  ALTER COLUMN user_id DROP NOT NULL;

-- Allow guests (no auth) to insert reviews
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;

CREATE POLICY "Anyone can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (true);
