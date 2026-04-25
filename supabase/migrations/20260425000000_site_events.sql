-- Lightweight funnel analytics: page_view, add_to_cart, initiate_checkout, purchase
create table if not exists public.site_events (
  id          bigserial primary key,
  event_type  text not null,
  session_id  text not null,
  user_id     uuid null references public.users(id) on delete set null,
  path        text null,
  metadata    jsonb null,
  created_at  timestamptz not null default now()
);

create index if not exists site_events_created_at_idx on public.site_events (created_at desc);
create index if not exists site_events_event_type_created_at_idx on public.site_events (event_type, created_at desc);
create index if not exists site_events_session_id_idx on public.site_events (session_id);

alter table public.site_events enable row level security;

-- Only service role inserts/reads. (No public policies = locked down.)
