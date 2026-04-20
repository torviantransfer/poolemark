-- Shipping companies table for dynamic shipping management
CREATE TABLE IF NOT EXISTS shipping_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE, -- e.g., 'yurtici', 'aras', 'mng'
  logo_url TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  free_shipping_threshold NUMERIC(10, 2) DEFAULT 500, -- Free shipping above this amount
  estimated_days TEXT DEFAULT '1-3 İş Günü', -- e.g., '2-4 İş Günü'
  tracking_url_template TEXT, -- e.g., 'https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code={tracking_number}'
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE shipping_companies ENABLE ROW LEVEL SECURITY;

-- Public read access for active companies
CREATE POLICY "Public can read active shipping companies"
  ON shipping_companies FOR SELECT
  USING (is_active = true);

-- Admin full access
CREATE POLICY "Admin full access to shipping companies"
  ON shipping_companies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seed default shipping companies
INSERT INTO shipping_companies (name, code, price, free_shipping_threshold, estimated_days, tracking_url_template, sort_order) VALUES
  ('Yurtiçi Kargo', 'yurtici', 49.90, 500, '1-3 İş Günü', 'https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code={tracking_number}', 1),
  ('Aras Kargo', 'aras', 44.90, 500, '2-4 İş Günü', 'https://www.araskargo.com.tr/trs_gonderi_sorgula.aspx?p_kod={tracking_number}', 2),
  ('MNG Kargo', 'mng', 42.90, 500, '2-4 İş Günü', 'https://www.mngkargo.com.tr/gonderi-takip/?gonderino={tracking_number}', 3),
  ('Sürat Kargo', 'surat', 39.90, 500, '2-5 İş Günü', 'https://www.suratkargo.com.tr/gonderi-takip?code={tracking_number}', 4),
  ('PTT Kargo', 'ptt', 34.90, 500, '3-5 İş Günü', 'https://gonderitakip.ptt.gov.tr/Track/Verify?q={tracking_number}', 5);
