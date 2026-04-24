-- Track 404 (not found) requests so admin can spot broken links and missing redirects.
CREATE TABLE IF NOT EXISTS public.not_found_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS not_found_logs_created_at_idx
  ON public.not_found_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS not_found_logs_path_idx
  ON public.not_found_logs (path);

ALTER TABLE public.not_found_logs ENABLE ROW LEVEL SECURITY;
-- No public policies; only service-role (admin client) writes/reads.
