-- Stock back-in-stock notification subscriptions
create table if not exists public.stock_notifications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid null references public.product_variants(id) on delete cascade,
  notified_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists stock_notifications_product_idx
  on public.stock_notifications (product_id, variant_id)
  where notified_at is null;

create unique index if not exists stock_notifications_unique_pending
  on public.stock_notifications (email, product_id, coalesce(variant_id::text, ''))
  where notified_at is null;

alter table public.stock_notifications enable row level security;

-- Anyone can subscribe (insert)
drop policy if exists "stock_notifications_insert_anyone" on public.stock_notifications;
create policy "stock_notifications_insert_anyone"
  on public.stock_notifications
  for insert
  with check (true);

-- Only service role / admin can read or modify
drop policy if exists "stock_notifications_admin_select" on public.stock_notifications;
create policy "stock_notifications_admin_select"
  on public.stock_notifications
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "stock_notifications_admin_update" on public.stock_notifications;
create policy "stock_notifications_admin_update"
  on public.stock_notifications
  for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
