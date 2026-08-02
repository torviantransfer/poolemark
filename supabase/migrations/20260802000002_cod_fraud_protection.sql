-- Kapıda ödeme sahtekarlık koruması
-- 1) Rate-limit için sipariş üzerinde istemci IP'si tutulur.
-- 2) WhatsApp onayı gelmeyen COD siparişleri 2 saat sonra otomatik iptal edilir (stok iadesiyle).

alter table public.orders
  add column if not exists customer_ip text;

-- Rate-limit sorguları için indeks (payment_method + created_at).
create index if not exists orders_cod_ratelimit_idx
  on public.orders (payment_method, created_at);

create index if not exists orders_customer_ip_idx
  on public.orders (customer_ip);

-- Onaylanmayan kapıda ödeme siparişlerini iptal eder ve stoğu iade eder.
-- Yalnızca WhatsApp onay mesajı gönderilmiş (cod_whatsapp_sent_at dolu),
-- hâlâ 'pending' durumunda ve 2 saatten eski siparişleri hedefler.
create or replace function public.cancel_stale_cod_orders()
returns integer
language plpgsql
security definer
as $$
declare
  v_order record;
  v_count integer := 0;
begin
  for v_order in
    select id
    from public.orders
    where payment_method = 'cash_on_delivery'
      and cod_confirmation_status = 'pending'
      and status = 'pending'
      and cod_whatsapp_sent_at is not null
      and created_at < now() - interval '2 hours'
  loop
    -- Stok iadesi (sipariş oluşturulurken düşülen miktarlar geri eklenir).
    update public.products p
    set stock_quantity = stock_quantity + oi.quantity
    from public.order_items oi
    where oi.order_id = v_order.id
      and oi.product_id = p.id;

    -- Siparişi iptal et.
    update public.orders
    set status = 'cancelled',
        cod_confirmation_status = 'rejected'
    where id = v_order.id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- pg_cron kuruluysa 15 dakikada bir çalıştır. Kurulu değilse sessizce atlanır
-- (fonksiyon manuel de çağrılabilir: select public.cancel_stale_cod_orders();).
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if exists (select 1 from cron.job where jobname = 'cancel-stale-cod-orders') then
      perform cron.unschedule('cancel-stale-cod-orders');
    end if;
    perform cron.schedule(
      'cancel-stale-cod-orders',
      '*/15 * * * *',
      'select public.cancel_stale_cod_orders();'
    );
  end if;
end $$;
