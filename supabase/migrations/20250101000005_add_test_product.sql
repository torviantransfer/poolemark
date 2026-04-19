-- Add a test product with category for demo purposes

-- First, ensure we have a category
INSERT INTO public.categories (name, slug, description, is_active, sort_order)
VALUES ('Mutfak Gereçleri', 'mutfak-gerecleri', 'Kaliteli mutfak gereçleri ve aksesuarları', true, 1)
ON CONFLICT (slug) DO NOTHING;

-- Insert the test product
INSERT INTO public.products (
  name,
  slug,
  description,
  price,
  compare_at_price,
  stock_quantity,
  sku,
  is_active,
  is_featured,
  category_id
) VALUES (
  'Premium Paslanmaz Çelik Tencere Seti - 6 Parça',
  'premium-paslanmaz-celik-tencere-seti-6-parca',
  '<h3>Premium Paslanmaz Çelik Tencere Seti</h3>
<p>Mutfağınız için en kaliteli paslanmaz çelik tencere seti. 18/10 krom-nikel paslanmaz çelik malzemeden üretilmiş, sağlığınız için güvenli ve dayanıklı.</p>

<h3>Set İçeriği</h3>
<ul>
<li>1 adet 16 cm sosluk (kapaklı)</li>
<li>1 adet 18 cm tencere (kapaklı)</li>
<li>1 adet 20 cm tencere (kapaklı)</li>
<li>1 adet 22 cm derin tencere (kapaklı)</li>
<li>1 adet 24 cm düdüklü tencere (kapaklı)</li>
<li>1 adet 26 cm karnıyarık tencere (kapaklı)</li>
</ul>

<h3>Özellikler</h3>
<ul>
<li><strong>Malzeme:</strong> 18/10 Krom-Nikel Paslanmaz Çelik</li>
<li><strong>Taban:</strong> Kapsüllü sandviç taban, tüm ocak türlerine uyumlu</li>
<li><strong>Kapak:</strong> Cam kapak, buhar deliği</li>
<li><strong>Uyumluluk:</strong> İndüksiyon dahil tüm ocak tipleri</li>
<li><strong>Bulaşık Makinesi:</strong> Uyumlu</li>
<li><strong>Garanti:</strong> 2 yıl üretici garantisi</li>
</ul>

<h3>Neden Bu Set?</h3>
<p>Kapsüllü taban teknolojisi sayesinde ısıyı eşit dağıtır, yemeklerinizin her yerinde aynı pişme kalitesini sağlar. Ergonomik bakalit kulplar ısıya dayanıklıdır ve güvenli tutuş sağlar.</p>',
  1299.99,
  1899.99,
  50,
  'PLM-MG-001',
  true,
  true,
  (SELECT id FROM public.categories WHERE slug = 'mutfak-gerecleri' LIMIT 1)
)
ON CONFLICT (slug) DO NOTHING;

-- Add a placeholder product image
INSERT INTO public.product_images (product_id, url, alt_text, sort_order, is_primary)
VALUES (
  (SELECT id FROM public.products WHERE slug = 'premium-paslanmaz-celik-tencere-seti-6-parca' LIMIT 1),
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop&q=80',
  'Premium Paslanmaz Çelik Tencere Seti - 6 Parça',
  1,
  true
)
ON CONFLICT DO NOTHING;
