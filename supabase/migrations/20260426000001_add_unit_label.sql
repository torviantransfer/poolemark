-- Add unit_label column to products
-- This allows merchants to define a human-readable package description
-- e.g. "6 Panel Set", "3'lü Paket", "1 Rulo (10m)"
-- When set, this label is shown in the cart, product page and order summary
-- to eliminate confusion about how many items the customer is buying.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS unit_label VARCHAR(100) NULL;

COMMENT ON COLUMN public.products.unit_label IS
  'Optional human-readable package label, e.g. "6 Panel Set". Displayed in cart and product page.';
