-- Kapıda ödeme (cash on delivery) altyapısı
-- Sipariş kolonları: ücret, ödeme tipi (nakit/kart), WhatsApp onay durumu.

alter table public.orders
  add column if not exists cod_fee numeric(10, 2) not null default 0;

alter table public.orders
  add column if not exists cod_payment_type text; -- 'cash' | 'card'

-- WhatsApp onay akışı: 'pending' | 'confirmed' | 'rejected'
alter table public.orders
  add column if not exists cod_confirmation_status text;

alter table public.orders
  add column if not exists cod_whatsapp_sent_at timestamptz;

-- Gönderilen onay mesajının WhatsApp message id'si (webhook eşlemesi için).
alter table public.orders
  add column if not exists cod_whatsapp_message_id text;

create index if not exists orders_cod_whatsapp_message_id_idx
  on public.orders (cod_whatsapp_message_id);

-- Ürün bazlı kapıda ödeme aç/kapa (varsayılan: açık).
alter table public.products
  add column if not exists cod_enabled boolean not null default true;

-- Admin panelinden yönetilecek kapıda ödeme ayarları.
insert into public.site_settings (key, value)
values
  ('cod_enabled', 'false'::jsonb),
  ('cod_fee', '0'::jsonb),
  ('cod_min_amount', '0'::jsonb),
  ('cod_max_amount', '0'::jsonb),
  ('cod_online_discount_percent', '0'::jsonb),
  ('cod_whatsapp_confirmation', 'true'::jsonb)
on conflict (key) do nothing;
