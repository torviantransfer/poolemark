alter table public.users
  add column if not exists notification_preferences jsonb not null default '{"order": true, "marketing": true, "stock": true}'::jsonb;
