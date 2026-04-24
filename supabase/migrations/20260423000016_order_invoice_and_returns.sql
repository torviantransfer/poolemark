-- Order invoices + return request workflow

alter table public.orders
  add column if not exists invoice_number text,
  add column if not exists invoice_url text;

create table if not exists public.order_return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  reason text not null,
  description text,
  status text not null default 'requested' check (status in ('requested', 'approved', 'in_transit', 'completed', 'rejected')),
  return_shipping_company text,
  return_barcode text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(order_id)
);

drop trigger if exists set_updated_at_order_return_requests on public.order_return_requests;
create trigger set_updated_at_order_return_requests
  before update on public.order_return_requests
  for each row
  execute function public.update_updated_at_column();

alter table public.order_return_requests enable row level security;

-- Customer can view own return requests
drop policy if exists "Users can view own return requests" on public.order_return_requests;
create policy "Users can view own return requests"
  on public.order_return_requests
  for select
  using (user_id = auth.uid());

-- Customer can create return request only for own order
drop policy if exists "Users can create own return requests" on public.order_return_requests;
create policy "Users can create own return requests"
  on public.order_return_requests
  for insert
  with check (
    user_id = auth.uid() and
    exists (
      select 1
      from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- Admin full access
drop policy if exists "Admin can manage return requests" on public.order_return_requests;
create policy "Admin can manage return requests"
  on public.order_return_requests
  for all
  using (public.is_admin())
  with check (public.is_admin());
