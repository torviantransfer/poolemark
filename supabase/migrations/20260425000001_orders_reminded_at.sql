-- Track WhatsApp/email reminders for abandoned (payment_status='pending') orders
-- so admin can see which customers were already contacted.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS reminded_at timestamptz;

CREATE INDEX IF NOT EXISTS orders_reminded_at_idx
  ON public.orders (reminded_at);
