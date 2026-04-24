-- Sözleşme/sayfa içeriklerinde resmi unvan güncelle
UPDATE pages
SET content = REPLACE(content, 'Unvan: Poolemark<br>', 'Unvan: Poolemark Ltd. Şti.<br>')
WHERE content LIKE '%Unvan: Poolemark<br>%';

-- KVKK aydınlatma metnindeki veri sorumlusu adı
UPDATE pages
SET content = REPLACE(content, '<p><strong>Poolemark</strong><br>', '<p><strong>Poolemark Ltd. Şti.</strong><br>')
WHERE slug IN ('kvkk-aydinlatma-metni', 'kvkk');
