-- Aras Kargo → Kolay Gelsin olarak güncelle
UPDATE shipping_companies
SET 
  name = 'Kolay Gelsin',
  code = 'kolaygelsin',
  tracking_url_template = 'https://www.kolaygelsin.com/kargo-takip?trackingNumber={tracking_number}'
WHERE code = 'aras';
