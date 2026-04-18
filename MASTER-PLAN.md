# POOLEMARK E-TİCARET — MASTER PLAN

## Proje Bilgileri

| Bilgi | Değer |
|---|---|
| **Domain** | poolemark.com |
| **Framework** | Next.js 14+ (App Router, TypeScript) |
| **UI** | Tailwind CSS + Shadcn/ui |
| **Veritabanı** | Supabase (PostgreSQL) |
| **Ödeme** | PayTR (aktif) |
| **E-posta** | Resend (ücretsiz) |
| **Deploy** | Vercel |
| **Proje Klasörü** | C:\Users\user\Desktop\poolemark |

## Tasarım Kararları

| Karar | Değer |
|---|---|
| **Stil** | Modern Minimal + Sıcak Dokunuş |
| **Accent Renk** | Turuncu (#E8712B) |
| **Font** | Inter |
| **Arka Plan** | Beyaz (#FFFFFF) + Warm Gray (#F7F5F3) |
| **Metin** | Koyu Antrasit (#2D2D2D) |
| **İkincil Metin** | Orta Gri (#737373) |
| **Hover** | Koyu Turuncu (#C45D1F) |
| **Başarı** | Yeşil (#16A34A) |
| **Hata** | Kırmızı (#DC2626) |
| **Badge/İndirim BG** | Açık Turuncu (#FFF3EB) |

## Mevcut Durum

- Shopify'da aktif satış yapılıyor
- Trafik sosyal medyadan geliyor (Facebook, TikTok, Instagram)
- Google'da marka aramasıyla bulunuyor, ürün aramasıyla bulunmuyor
- Fatura manuel kesiliyor, kargo takip numaraları elle giriliyor
- Ürün kategorisi: Ev gereçleri ve hırdavat (PVC panel, folyo, 3D panel, deterjan hazneli tuvalet fırcası, sıvı sabunluk vs.)

## Geçiş Stratejisi

- Shopify paralel çalışacak, yeni site hazır olunca geçiş
- 301 redirect ile SEO korunacak
- Ürün verileri Shopify CSV export → Supabase import

---

# FAZ 0 — PROJE KURULUMU

## 0.1 — Next.js Proje Oluşturma
- [x] `create-next-app` ile TypeScript + Tailwind + App Router
- [ ] ESLint + Prettier konfigürasyonu

## 0.2 — Shadcn/ui Kurulumu
- [ ] Shadcn/ui init
- [ ] Temel componentlerin yüklenmesi (Button, Input, Card, Dialog, Sheet, Table, Dropdown, Toast, Badge, Separator, Skeleton)

## 0.3 — Tailwind Tema Konfigürasyonu
- [ ] Renk paleti tanımları (primary, secondary, accent, destructive, muted, background, foreground)
- [ ] Font tanımı (Inter)
- [ ] Responsive breakpoint'lar
- [ ] Custom spacing/radius

## 0.4 — Klasör Yapısı
```
src/
├── app/
│   ├── (store)/          → Müşteri sayfaları
│   ├── (auth)/           → Login/Register
│   ├── admin/            → Admin panel
│   └── api/              → API route'ları
├── components/
│   ├── ui/               → Shadcn components
│   ├── store/            → Mağaza componentleri
│   ├── admin/            → Admin componentleri
│   └── shared/           → Ortak componentler
├── lib/                  → Utility, helpers, config
├── hooks/                → Custom React hooks
├── types/                → TypeScript type'lar
├── services/             → API service fonksiyonları
└── constants/            → Sabit değerler
```

## 0.5 — Supabase Kurulumu
- [ ] Supabase proje oluşturma
- [ ] Supabase client konfigürasyonu
- [ ] .env.local dosyası (tüm env variables)

## 0.6 — Resend Kurulumu
- [ ] Resend hesap oluşturma (ücretsiz plan)
- [ ] API key alma
- [ ] Domain doğrulama
- [ ] E-posta şablonları için react-email kurulumu

## 0.7 — Git Repo
- [ ] Git init + .gitignore
- [ ] İlk commit

---

# FAZ 1 — VERİTABANI ŞEMASI & AUTH

## 1.1 — Veritabanı Tabloları

### users
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| email | varchar | Unique, NOT NULL |
| password_hash | varchar | Hashlenmiş şifre |
| first_name | varchar | Ad |
| last_name | varchar | Soyad |
| phone | varchar | Telefon |
| role | enum | customer / admin |
| avatar_url | varchar | Profil görseli |
| email_verified | boolean | E-posta doğrulandı mı |
| created_at | timestamp | Kayıt tarihi |
| updated_at | timestamp | Güncelleme tarihi |

### addresses
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| user_id | uuid (FK) | users.id |
| title | varchar | Ev, İş vs. |
| first_name | varchar | Alıcı adı |
| last_name | varchar | Alıcı soyadı |
| phone | varchar | Alıcı telefon |
| city | varchar | İl |
| district | varchar | İlçe |
| neighborhood | varchar | Mahalle |
| address_line | text | Açık adres |
| postal_code | varchar | Posta kodu |
| is_default | boolean | Varsayılan adres mi |
| created_at | timestamp | Oluşturma tarihi |
| updated_at | timestamp | Güncelleme tarihi |

### categories
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| name | varchar | Kategori adı |
| slug | varchar | URL-friendly isim (unique) |
| description | text | Açıklama (SEO için) |
| image_url | varchar | Kategori görseli |
| parent_id | uuid (FK, nullable) | Üst kategori (self-ref) |
| sort_order | int | Sıralama |
| is_active | boolean | Aktif mi |
| meta_title | varchar | SEO başlık |
| meta_description | varchar | SEO açıklama |
| created_at | timestamp | Oluşturma tarihi |
| updated_at | timestamp | Güncelleme tarihi |

### products
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| name | varchar | Ürün adı |
| slug | varchar | URL-friendly isim (unique) |
| description | text | Detaylı açıklama (HTML) |
| short_description | text | Kısa açıklama |
| sku | varchar | Stok kodu |
| barcode | varchar | Barkod |
| price | decimal | Satış fiyatı |
| compare_at_price | decimal (nullable) | Önceki fiyat (indirim gösterimi) |
| cost_price | decimal (nullable) | Maliyet fiyatı |
| stock_quantity | int | Stok miktarı |
| low_stock_threshold | int | Düşük stok eşiği |
| weight | decimal (nullable) | Ağırlık (gr) |
| is_active | boolean | Aktif mi |
| is_featured | boolean | Öne çıkan mı |
| category_id | uuid (FK) | categories.id |
| meta_title | varchar | SEO başlık |
| meta_description | varchar | SEO açıklama |
| created_at | timestamp | Oluşturma tarihi |
| updated_at | timestamp | Güncelleme tarihi |

### product_images
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| product_id | uuid (FK) | products.id |
| url | varchar | Görsel URL |
| alt_text | varchar | Alt text (SEO) |
| sort_order | int | Sıralama |
| is_primary | boolean | Ana görsel mi |

### product_variants
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| product_id | uuid (FK) | products.id |
| name | varchar | Varyant adı (ör: "Kırmızı - L") |
| sku | varchar | Varyant stok kodu |
| price | decimal | Varyant fiyatı |
| stock_quantity | int | Varyant stoku |
| sort_order | int | Sıralama |

### orders
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| order_number | varchar | Sipariş numarası (unique) |
| user_id | uuid (FK, nullable) | users.id (null = misafir) |
| guest_email | varchar (nullable) | Misafir e-posta |
| guest_phone | varchar (nullable) | Misafir telefon |
| status | enum | pending / confirmed / preparing / shipped / delivered / cancelled / returned |
| subtotal | decimal | Ara toplam |
| shipping_cost | decimal | Kargo ücreti |
| discount_amount | decimal | İndirim tutarı |
| total | decimal | Genel toplam |
| payment_method | varchar | Ödeme yöntemi |
| payment_status | enum | pending / paid / failed / refunded |
| shipping_address_json | jsonb | Teslimat adresi snapshot |
| billing_address_json | jsonb | Fatura adresi snapshot |
| cargo_company | varchar (nullable) | Kargo firması |
| cargo_tracking_number | varchar (nullable) | Kargo takip no |
| cargo_tracking_url | varchar (nullable) | Kargo takip linki |
| note | text (nullable) | Sipariş notu |
| ip_address | varchar | Müşteri IP |
| created_at | timestamp | Sipariş tarihi |
| updated_at | timestamp | Güncelleme tarihi |

### order_items
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| order_id | uuid (FK) | orders.id |
| product_id | uuid (FK) | products.id |
| product_name | varchar | Ürün adı snapshot |
| product_image | varchar | Ürün görseli snapshot |
| variant_info | varchar (nullable) | Varyant bilgisi |
| quantity | int | Adet |
| unit_price | decimal | Birim fiyat |
| total_price | decimal | Toplam fiyat |

### cart_items
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| user_id | uuid (FK, nullable) | users.id |
| session_id | varchar (nullable) | Misafir oturum ID |
| product_id | uuid (FK) | products.id |
| variant_id | uuid (FK, nullable) | product_variants.id |
| quantity | int | Adet |
| created_at | timestamp | Ekleme tarihi |
| updated_at | timestamp | Güncelleme tarihi |

### coupons
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| code | varchar | Kupon kodu (unique) |
| type | enum | percentage / fixed_amount / free_shipping |
| value | decimal | İndirim değeri |
| min_order_amount | decimal (nullable) | Min sipariş tutarı |
| max_uses | int (nullable) | Max kullanım |
| used_count | int | Kullanım sayısı |
| starts_at | timestamp | Başlangıç |
| expires_at | timestamp | Bitiş |
| is_active | boolean | Aktif mi |
| created_at | timestamp | Oluşturma tarihi |

### reviews
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| product_id | uuid (FK) | products.id |
| user_id | uuid (FK) | users.id |
| rating | int | 1-5 yıldız |
| comment | text | Yorum metni |
| is_approved | boolean | Onaylandı mı |
| created_at | timestamp | Yorum tarihi |

### banners
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| title | varchar | Başlık |
| subtitle | varchar (nullable) | Alt başlık |
| image_url | varchar | Banner görseli |
| link_url | varchar (nullable) | Tıklama linki |
| sort_order | int | Sıralama |
| is_active | boolean | Aktif mi |
| position | enum | hero / sidebar / footer |
| starts_at | timestamp (nullable) | Gösterim başlangıç |
| expires_at | timestamp (nullable) | Gösterim bitiş |

### pages (CMS)
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| title | varchar | Sayfa başlığı |
| slug | varchar | URL slug (unique) |
| content | text | HTML içerik |
| meta_title | varchar | SEO başlık |
| meta_description | varchar | SEO açıklama |
| is_active | boolean | Aktif mi |
| created_at | timestamp | Oluşturma tarihi |
| updated_at | timestamp | Güncelleme tarihi |

### blog_posts
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| title | varchar | Başlık |
| slug | varchar | URL slug (unique) |
| content | text | HTML içerik |
| excerpt | text | Özet |
| cover_image_url | varchar | Kapak görseli |
| author_id | uuid (FK) | users.id |
| is_published | boolean | Yayında mı |
| meta_title | varchar | SEO başlık |
| meta_description | varchar | SEO açıklama |
| published_at | timestamp (nullable) | Yayın tarihi |
| created_at | timestamp | Oluşturma tarihi |
| updated_at | timestamp | Güncelleme tarihi |

### contact_messages
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| name | varchar | Gönderen adı |
| email | varchar | Gönderen e-posta |
| phone | varchar (nullable) | Gönderen telefon |
| subject | varchar | Konu |
| message | text | Mesaj |
| is_read | boolean | Okundu mu |
| created_at | timestamp | Gönderim tarihi |

### site_settings
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| key | varchar | Ayar anahtarı (unique) |
| value | jsonb | Ayar değeri |

### announcements (Header Banner)
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| text | varchar | Duyuru metni |
| link_url | varchar (nullable) | Link |
| bg_color | varchar | Arka plan rengi |
| text_color | varchar | Yazı rengi |
| is_active | boolean | Aktif mi |
| sort_order | int | Sıralama |

### newsletter_subscribers
| Kolon | Tip | Açıklama |
|---|---|---|
| id | uuid (PK) | Otomatik |
| email | varchar | E-posta (unique) |
| is_active | boolean | Aktif mi |
| created_at | timestamp | Kayıt tarihi |

## 1.2 — Supabase Migration
- [ ] Tüm tabloların oluşturulması
- [ ] Foreign key ilişkileri
- [ ] Index'ler (slug, email, order_number, created_at)
- [ ] Row Level Security (RLS) kuralları

## 1.3 — Auth — Kayıt
- [ ] Kayıt formu: Ad, Soyad, E-posta, Telefon, Şifre, Şifre Tekrar
- [ ] E-posta format doğrulama
- [ ] Şifre güçlülük kontrolü (min 8 karakter, büyük/küçük harf, rakam)
- [ ] Telefon format doğrulama
- [ ] Zaten kayıtlı e-posta kontrolü
- [ ] Başarılı kayıt → otomatik giriş → anasayfaya yönlendirme
- [ ] KVKK / Üyelik sözleşmesi onay checkbox
- [ ] Resend ile hoşgeldin e-postası

## 1.4 — Auth — Giriş
- [ ] E-posta + Şifre ile giriş
- [ ] "Beni Hatırla" checkbox
- [ ] Giriş başarısız → hata mesajı (genel mesaj, tekil bilgi sızdırmaz)
- [ ] Başarılı → önceki sayfaya veya anasayfaya yönlendirme
- [ ] Brute force koruması (rate limiting)

## 1.5 — Auth — Şifremi Unuttum
- [ ] E-posta gir → Resend ile sıfırlama linki gönder
- [ ] Sıfırlama sayfası: Yeni şifre + tekrar
- [ ] Token süreli (1 saat)
- [ ] Başarılı → giriş sayfasına yönlendirme

## 1.6 — Auth — Middleware
- [ ] Korumalı route'lar (hesabım, admin)
- [ ] Admin role kontrolü
- [ ] Session yönetimi
- [ ] Auth state provider (client-side)

---

# FAZ 2 — ADMIN PANEL

## 2.1 — Admin Layout
- [ ] Sol sidebar menü (collapse edilebilir)
- [ ] Üst navbar: Admin adı, bildirim ikonu, çıkış
- [ ] Breadcrumb navigasyonu
- [ ] Responsive (mobilde hamburger menü)

**Sidebar Menü Öğeleri:**
- Dashboard
- Ürünler (Alt: Liste, Ekle)
- Kategoriler
- Siparişler
- Müşteriler
- Kuponlar/Kampanyalar
- Blog (Alt: Yazılar, Ekle)
- Sayfalar (CMS)
- Bannerlar/Slider
- Duyurular
- Mesajlar
- Yorumlar
- Raporlar
- Ayarlar

## 2.2 — Dashboard
- [ ] Bugünkü satış tutarı (kart)
- [ ] Bugünkü sipariş sayısı (kart)
- [ ] Toplam müşteri sayısı (kart)
- [ ] Bekleyen sipariş sayısı (kart)
- [ ] Son 7 gün / 30 gün satış grafiği (çizgi grafik)
- [ ] Son 10 sipariş listesi (tablo)
- [ ] En çok satan 5 ürün
- [ ] Stok azalan ürünler uyarısı
- [ ] Son gelen mesajlar

## 2.3 — Ürün Yönetimi

### Ürün Listeleme
- [ ] Tablo: Görsel, Ad, SKU, Fiyat, Stok, Kategori, Durum, Tarih
- [ ] Arama (isim, SKU)
- [ ] Filtreleme: Kategori, durum (aktif/pasif), stok durumu
- [ ] Sıralama: İsim, fiyat, stok, tarih
- [ ] Sayfalama
- [ ] Toplu işlem: Seç → Sil / Pasife al / Aktife al
- [ ] Excel export

### Ürün Ekleme/Düzenleme (Sekmeli Form)

**Genel Bilgiler Sekmesi:**
- [ ] Ürün adı
- [ ] Slug (otomatik oluşturma + manuel düzenleme)
- [ ] Kısa açıklama
- [ ] Detaylı açıklama (zengin metin editörü — bold, italic, liste, link, başlık)
- [ ] Kategori seçimi (dropdown)
- [ ] Durum (aktif/pasif) toggle

**Fiyat & Stok Sekmesi:**
- [ ] Satış fiyatı
- [ ] Karşılaştırma fiyatı (üstü çizili gösterilecek)
- [ ] Maliyet fiyatı
- [ ] SKU
- [ ] Barkod
- [ ] Stok miktarı
- [ ] Düşük stok uyarı eşiği
- [ ] Ağırlık (kargo hesaplama için)

**Görseller Sekmesi:**
- [ ] Çoklu görsel yükleme (drag & drop)
- [ ] Sıralama (drag ile)
- [ ] Ana görsel seçme
- [ ] Alt text girişi
- [ ] Görsel silme
- [ ] Görsel önizleme

**SEO Sekmesi:**
- [ ] Meta title (karakter sayacı — max 60)
- [ ] Meta description (karakter sayacı — max 155)
- [ ] OG Image önizleme

**Varyantlar Sekmesi (opsiyonel):**
- [ ] Varyant ekleme (renk, boyut vs.)
- [ ] Her varyant için ayrı fiyat ve stok

## 2.4 — Kategori Yönetimi
- [ ] Kategori listesi (ağaç yapısı — parent/child)
- [ ] Ekle: Ad, slug, açıklama, görsel, üst kategori, sıralama, SEO alanları
- [ ] Düzenle
- [ ] Sil (altında ürün varsa uyarı)
- [ ] Sıralama (drag & drop)
- [ ] Aktif/Pasif toggle

## 2.5 — Sipariş Yönetimi

### Sipariş Listesi
- [ ] Tablo: Sipariş No, Müşteri, Toplam, Ödeme Durumu, Sipariş Durumu, Tarih
- [ ] Filtreleme: Durum, ödeme durumu, tarih aralığı
- [ ] Arama: Sipariş no, müşteri adı, e-posta
- [ ] Sayfalama

### Sipariş Detay
- [ ] Müşteri bilgileri
- [ ] Teslimat adresi
- [ ] Sipariş kalemleri (ürün görseli, ad, miktar, birim fiyat, toplam)
- [ ] Ara toplam, kargo, indirim, genel toplam
- [ ] Ödeme bilgisi ve durumu
- [ ] Durum güncelleme dropdown (Onaylandı → Hazırlanıyor → Kargoya Verildi → Teslim Edildi)
- [ ] Kargo bilgisi girme: Kargo firması, takip numarası
- [ ] Sipariş notu
- [ ] Sipariş geçmişi (timeline: ne zaman ne oldu)
- [ ] İptal / İade butonu

## 2.6 — Müşteri Yönetimi
- [ ] Müşteri listesi: Ad, E-posta, Telefon, Sipariş Sayısı, Toplam Harcama, Kayıt Tarihi
- [ ] Arama
- [ ] Müşteri detay: Bilgiler + sipariş geçmişi + adresleri
- [ ] Müşteriyi deaktif etme

## 2.7 — Kupon / Kampanya Yönetimi
- [ ] Kupon listesi
- [ ] Kupon oluşturma: Kod, tip (yüzde/sabit tutar/ücretsiz kargo), değer, min sipariş tutarı, max kullanım, başlangıç/bitiş tarihi
- [ ] Düzenle / Sil
- [ ] Aktif/Pasif toggle
- [ ] Kullanım istatistiği

## 2.8 — Blog Yönetimi
- [ ] Blog yazıları listesi: Başlık, Durum, Yayın Tarihi
- [ ] Yeni yazı: Başlık, slug, içerik (zengin metin editörü), özet, kapak görseli, SEO alanları, yayınla/taslak
- [ ] Düzenle / Sil

## 2.9 — Sayfa Yönetimi (CMS)
- [ ] Sabit sayfalar: Hakkımızda, İletişim, KVKK, Gizlilik Politikası, Mesafeli Satış Sözleşmesi, İade Politikası, Kargo Bilgileri
- [ ] Her sayfa: Başlık, slug, içerik (zengin editör), SEO alanları
- [ ] Ekle / Düzenle / Sil

## 2.10 — Banner / Slider Yönetimi
- [ ] Banner listesi
- [ ] Ekle: Başlık, alt başlık, görsel, link, pozisyon (hero/alt banner), sıralama, aktif/pasif, başlangıç/bitiş tarihi
- [ ] Düzenle / Sil
- [ ] Sıralama (drag & drop)

## 2.11 — Duyuru Yönetimi (Header Banner)
- [ ] Üst bar mesajları: "Kargo bedava!" gibi
- [ ] Metin, link, arka plan rengi, yazı rengi
- [ ] Aktif/Pasif

## 2.12 — Mesaj Yönetimi
- [ ] Gelen mesajlar listesi (iletişim formundan)
- [ ] Okundu/okunmadı durumu
- [ ] Mesaj detay
- [ ] Silme

## 2.13 — Yorum Yönetimi
- [ ] Onay bekleyen yorumlar
- [ ] Onayla / Reddet
- [ ] Yorum listesi: Ürün, Müşteri, Puan, Yorum, Durum, Tarih

## 2.14 — Raporlar
- [ ] Satış raporu (tarih aralığı seçimi)
- [ ] En çok satan ürünler
- [ ] Kategori bazlı satış
- [ ] Müşteri bazlı satış
- [ ] Günlük/haftalık/aylık gelir
- [ ] CSV export

## 2.15 — Site Ayarları
- [ ] Genel: Site adı, logo, favicon, telefon, e-posta, adres
- [ ] Sosyal medya linkleri (Instagram, Facebook, TikTok, YouTube)
- [ ] Kargo ayarları: Ücretsiz kargo alt limiti, kargo ücreti
- [ ] Footer bilgileri
- [ ] Google Analytics ID
- [ ] Facebook Pixel ID

---

# FAZ 3 — MÜŞTERİ FRONTEND — LAYOUT & NAVİGASYON

## 3.1 — Announcement Bar (En Üst)
- [ ] Duyuru mesajı (admin'den yönetilen)
- [ ] Kapatma (X) butonu
- [ ] Opsiyonel link

## 3.2 — Header / Navbar
- [ ] Logo (sol)
- [ ] Arama çubuğu (orta) — mobilde ikon, tıklayınca açılır
- [ ] Navigasyon: Anasayfa, Kategoriler (mega menü/dropdown), Blog, İletişim, Hakkımızda
- [ ] Sağ taraf ikonları: Kullanıcı (giriş/hesabım), Favori (kalp + sayı badge), Sepet (ikon + sayı badge)
- [ ] Sticky header (scroll'da sabit kalır)
- [ ] Mobil: Hamburger menü → slide-in sidebar

## 3.3 — Mega Menü / Kategori Dropdown
- [ ] Kategoriler → alt kategoriler
- [ ] Kategori görselleri (opsiyonel)
- [ ] Hover'da açılma (desktop), tıklama ile açılma (mobil)

## 3.4 — Footer
- [ ] 4 kolonlu layout:
  - Hakkımızda kısa metin + logo
  - Hızlı Linkler: Anasayfa, Ürünler, Blog, İletişim
  - Müşteri Hizmetleri: Kargo Bilgileri, İade Politikası, KVKK, Gizlilik Politikası
  - İletişim: Adres, telefon, e-posta, sosyal medya ikonları
- [ ] Alt bar: Copyright + ödeme yöntemleri ikonları (Visa, Mastercard, Troy)
- [ ] Responsive (mobilde tek kolon, accordion)

## 3.5 — Mobil Alt Navigasyon Bar
- [ ] Sabit alt bar (mobilde): Anasayfa, Kategoriler, Sepet (badge), Favori, Hesabım
- [ ] Aktif sayfa belirteci

---

# FAZ 4 — MÜŞTERİ FRONTEND — SAYFALAR

## 4.1 — Anasayfa
- [ ] Hero slider/banner (admin'den yönetilen)
- [ ] Kategori kartları bölümü (görsel + isim)
- [ ] Öne çıkan ürünler (grid, 8-12 ürün)
- [ ] İndirimli ürünler bölümü
- [ ] Güven bandı: Ücretsiz kargo ikonu, güvenli ödeme ikonu, kolay iade ikonu, 7/24 destek ikonu
- [ ] Yeni ürünler
- [ ] Blog yazıları (son 3)
- [ ] Newsletter aboneliği (e-posta input + buton)

## 4.2 — Ürün Listeleme (Kategori Sayfası)
- [ ] Breadcrumb: Anasayfa > Kategori
- [ ] Kategori başlığı + açıklama (SEO)
- [ ] Sol sidebar filtreler (desktop) / Alt sheet filtre (mobil):
  - Fiyat aralığı (min-max input veya slider)
  - Alt kategoriler
  - Sıralama: Varsayılan, Fiyat artan, Fiyat azalan, En yeni, En çok satan
- [ ] Ürün grid (2/3/4 kolon — responsive)
- [ ] Ürün kartı: Görsel (hover'da 2. görsel), Ad, Fiyat (eski fiyat üstü çizili + yeni fiyat), Yıldız puanı, Sepete ekle butonu, Favori kalp ikonu, İndirim badge (%), Yeni badge, Tükendi badge
- [ ] Sayfalama veya "Daha fazla yükle" butonu
- [ ] Ürün bulunamadı durumu
- [ ] Ürün sayısı gösterimi ("48 ürün bulundu")
- [ ] Grid/Liste görünüm değiştirme butonu

## 4.3 — Ürün Detay Sayfası
- [ ] Breadcrumb: Anasayfa > Kategori > Ürün

**Sol: Ürün Görselleri**
- [ ] Ana görsel (büyük)
- [ ] Thumbnail'lar (altında veya yanda)
- [ ] Tıklayınca büyütme (lightbox/zoom)
- [ ] Mobilde swipe gallery

**Sağ: Ürün Bilgileri**
- [ ] Ürün adı (H1)
- [ ] Yıldız puanı + yorum sayısı linki
- [ ] Fiyat (büyük, bold) — indirim varsa eski fiyat üstü çizili + indirim yüzdesi
- [ ] Kısa açıklama
- [ ] Varyant seçimi (varsa)
- [ ] Stok durumu (Stokta var / Son X adet / Tükendi)
- [ ] Adet seçici (- 1 +)
- [ ] **Sepete Ekle** butonu (büyük, accent renk)
- [ ] Favori butonu (kalp)
- [ ] Paylaş butonu (WhatsApp, Facebook, link kopyala)

**Alt Kısım (Sekmeler):**
- [ ] Ürün Açıklaması (detaylı HTML)
- [ ] Yorumlar (yıldız + yorum listesi + yorum yazma formu)
- [ ] Kargo & İade bilgisi

**Alt Bölümler:**
- [ ] İlgili / Benzer ürünler (yatay scroll veya grid)
- [ ] Son görüntülenen ürünler

## 4.4 — Arama
- [ ] Arama kutusu (navbar'da)
- [ ] Yazarken suggestion/autocomplete (ürün adları)
- [ ] Arama sonuç sayfası: Ürün grid + filtreler
- [ ] Sonuç bulunamadı durumu
- [ ] Arama terimi vurgulanır

## 4.5 — Sepet Sayfası
- [ ] Sepet boşsa: Boş sepet görseli + "Alışverişe Başla" butonu
- [ ] Sepet doluysa:
  - Ürün listesi: Görsel, Ad, Varyant, Birim fiyat, Adet (- x +), Toplam, Sil butonu
  - Kupon kodu input + "Uygula" butonu
  - Ara toplam
  - Kargo ücreti (veya "Ücretsiz Kargo")
  - İndirim tutarı (kupon varsa)
  - Genel Toplam (büyük, bold)
  - "Siparişi Tamamla" butonu
  - "Alışverişe Devam Et" linki

## 4.6 — Mini Sepet (Drawer/Sidebar)
- [ ] Sepet ikonuna tıklayınca sağdan açılır
- [ ] Ürün listesi (küçük görsel, ad, adet, fiyat, sil)
- [ ] Toplam tutar
- [ ] "Sepete Git" butonu
- [ ] "Siparişi Tamamla" butonu

## 4.7 — Checkout (Sipariş Tamamlama)

**Adım 1 — Bilgiler:**
- [ ] Giriş yapmamışsa: Misafir olarak devam / Giriş yap seçeneği
- [ ] Ad, Soyad, E-posta, Telefon

**Adım 2 — Adres:**
- [ ] Kayıtlı adreslerden seç (giriş yaptıysa)
- [ ] Yeni adres ekle: İl (dropdown), İlçe (dropdown), Mahalle, Adres, Posta kodu
- [ ] Fatura adresi aynı mı? Checkbox

**Adım 3 — Kargo:**
- [ ] Kargo seçeneği (standart/hızlı — veya tek seçenek)
- [ ] Tahmini teslimat süresi

**Adım 4 — Ödeme:**
- [ ] Sipariş Özeti (ürünler, tutarlar)
- [ ] PayTR ödeme formu (kredi kartı / havale)
- [ ] Sözleşme onay checkboxları:
  - Mesafeli Satış Sözleşmesi (link ile açılır)
  - Ön Bilgilendirme Formu (link ile açılır)
  - KVKK Aydınlatma Metni
- [ ] "Siparişi Onayla ve Öde" butonu

**Genel:**
- [ ] Adım göstergesi (1-2-3-4 step indicator üstte)

## 4.8 — Ödeme Sonucu
- [ ] Başarılı: Sipariş numarası, teşekkür mesajı, sipariş özeti, "Siparişlerimi Gör" butonu
- [ ] Başarısız: Hata mesajı, "Tekrar Dene" butonu

## 4.9 — Hesabım Sayfaları

### Hesabım — Dashboard
- [ ] Hoşgeldin mesajı
- [ ] Son siparişler (özet)
- [ ] Hızlı linkler: Siparişlerim, Adreslerim, Favorilerim, Bilgilerim

### Siparişlerim
- [ ] Sipariş listesi: Sipariş No, Tarih, Tutar, Durum (renkli badge), Detay butonu
- [ ] Sipariş Detay: Ürünler, teslimat adresi, ödeme bilgisi, kargo takip, durum timeline
- [ ] İade talebi butonu (Teslim Edildi durumundaysa)

### Adreslerim
- [ ] Adres kartları listesi
- [ ] Varsayılan adres işareti
- [ ] Ekle / Düzenle / Sil
- [ ] Varsayılan yap

### Favorilerim
- [ ] Favori ürün listesi (grid)
- [ ] Sepete ekle butonu
- [ ] Favoriden çıkar butonu
- [ ] Boşsa: "Henüz favori ürünün yok" mesajı

### Bilgilerim
- [ ] Ad, Soyad, E-posta, Telefon düzenleme
- [ ] Şifre değiştirme (mevcut şifre + yeni şifre + tekrar)

### Çıkış Yap
- [ ] Oturumu sonlandır, anasayfaya yönlendir

## 4.10 — Blog
- [ ] Blog listeleme: Kapak görseli, başlık, özet, tarih, "Devamını Oku" + sayfalama
- [ ] Blog detay: Başlık, kapak görseli, tarih, içerik, paylaşma butonları, ilgili ürünlere link
- [ ] SEO optimize (structured data)

## 4.11 — Statik Sayfalar
- [ ] Hakkımızda
- [ ] İletişim (form: ad, e-posta, telefon, konu, mesaj + WhatsApp butonu)
- [ ] KVKK Aydınlatma Metni
- [ ] Gizlilik Politikası
- [ ] Mesafeli Satış Sözleşmesi
- [ ] İade ve Değişim Politikası
- [ ] Kargo Bilgileri

## 4.12 — 404 Sayfası
- [ ] Özel tasarım
- [ ] "Anasayfaya Dön" butonu
- [ ] Popüler ürünler önerisi

---

# FAZ 5 — SEPET & CHECKOUT MANTIK

## 5.1 — Sepet İşlemleri
- [ ] Sepete ekleme (ürün + miktar + varyant)
- [ ] Stok kontrolü (stoktan fazla eklenemez)
- [ ] Misafir sepeti (localStorage + session_id) → giriş yapınca merge
- [ ] Giriş yapmış kullanıcı sepeti (DB)
- [ ] Miktar güncelleme
- [ ] Ürün silme
- [ ] Sepet sayısı güncelleme (navbar badge)

## 5.2 — Kupon Sistemi
- [ ] Kupon kodu doğrulama
- [ ] İndirim hesaplama (yüzde / sabit tutar / ücretsiz kargo)
- [ ] Min sipariş tutarı kontrolü
- [ ] Kupon süresi/kullanım limiti kontrolü

## 5.3 — Kargo Hesaplama
- [ ] Sabit kargo ücreti veya ücretsiz kargo alt limiti
- [ ] "Ücretsiz kargoya X TL kaldı" gösterimi

---

# FAZ 6 — ÖDEME ENTEGRASYONU (PayTR)

## 6.1 — PayTR API Entegrasyonu
- [ ] PayTR iFrame API bağlantısı
- [ ] Merchant ID, Key, Salt konfigürasyonu (.env)
- [ ] Token oluşturma (server-side API route)
- [ ] Ödeme formu render (iFrame)

## 6.2 — Ödeme Callback
- [ ] Başarılı ödeme callback → sipariş oluşturma
- [ ] Başarısız ödeme callback → hata sayfası
- [ ] Callback doğrulama (hash kontrolü — güvenlik)
- [ ] Duplicate callback koruması

## 6.3 — Sipariş Oluşturma
- [ ] Stok düşürme (transaction içinde)
- [ ] Sepet temizleme
- [ ] Sipariş kaydı oluşturma
- [ ] Sipariş numarası oluşturma (PM-000001 formatı)
- [ ] Resend ile sipariş onay e-postası

---

# FAZ 7 — BİLDİRİMLER (Resend)

## 7.1 — E-posta Şablonları (react-email)
- [ ] Hoşgeldin e-postası (kayıt sonrası)
- [ ] Şifre sıfırlama e-postası
- [ ] Sipariş onay e-postası (ürünler + tutar + sipariş no)
- [ ] Kargoya verildi e-postası (takip no + link)
- [ ] Sipariş iptal e-postası
- [ ] İade onay/red e-postası
- [ ] İletişim formu → admin'e bildirim e-postası
- [ ] Newsletter karşılama e-postası

## 7.2 — Admin Bildirimleri
- [ ] Yeni sipariş geldiğinde admin'e e-posta
- [ ] Düşük stok uyarısı e-postası
- [ ] Yeni iletişim mesajı bildirimi

---

# FAZ 8 — SEO & PERFORMANS

## 8.1 — SEO
- [ ] Her sayfa için meta title + description
- [ ] Open Graph tags (sosyal medya paylaşımı)
- [ ] Twitter Card tags
- [ ] Canonical URL'ler
- [ ] Sitemap.xml (otomatik oluşturma)
- [ ] Robots.txt
- [ ] JSON-LD Structured Data:
  - Product (fiyat, stok, yıldız)
  - BreadcrumbList
  - Organization
  - WebSite (arama)
  - BlogPosting
- [ ] Semantic HTML (h1, h2, article, nav, main, footer)
- [ ] Alt text (tüm görseller)
- [ ] 301 redirect'ler (Shopify URL → yeni URL)
- [ ] Hreflang (opsiyonel — çoklu dil)

## 8.2 — Performans
- [ ] Next.js Image optimization (next/image)
- [ ] Lazy loading (görseller, aşağıdaki bölümler)
- [ ] Dynamic import (ağır componentler)
- [ ] Supabase sorgu optimizasyonu
- [ ] Edge caching (Vercel)
- [ ] Bundle analiz ve gereksiz paket temizliği
- [ ] Skeleton loading (yüklenirken placeholder)
- [ ] Web Vitals monitoring (CLS, LCP, FID)

## 8.3 — Güvenlik
- [ ] CSRF koruması
- [ ] Rate limiting (API route'lar)
- [ ] Input sanitization (XSS koruması)
- [ ] SQL injection koruması (Supabase parameterized queries)
- [ ] Security headers (Helmet)
- [ ] Content Security Policy
- [ ] reCAPTCHA (iletişim formu, kayıt)
- [ ] Honeypot alanları (spam koruması)

## 8.4 — Analytics
- [ ] Google Analytics 4 entegrasyonu
- [ ] Facebook Pixel entegrasyonu
- [ ] Conversion tracking (satın alma eventi)
- [ ] Google Search Console doğrulama

---

# FAZ 9 — SON DOKUNUŞLAR & LANSMAN

## 9.1 — Shopify'dan Veri Taşıma
- [ ] Ürün CSV export → Supabase import (script yazılacak)
- [ ] Ürün görselleri taşıma (Supabase Storage)
- [ ] Kategori eşleştirme
- [ ] 301 redirect listesi oluşturma (Shopify URL → Next.js URL)

## 9.2 — Test
- [ ] Tüm sayfaların responsive testi (mobil/tablet/desktop)
- [ ] Checkout akışı test (PayTR sandbox)
- [ ] Edge case'ler (boş sepet, stok sıfır, geçersiz kupon)
- [ ] Cross-browser test (Chrome, Safari, Firefox, Edge)
- [ ] Lighthouse skoru kontrolü (hedef: 90+ her kategoride)
- [ ] Form validasyonları test
- [ ] E-posta gönderim testi (Resend)

## 9.3 — Vercel Deploy & Domain
- [ ] Vercel'e deploy
- [ ] poolemark.com DNS ayarları (Vercel'e yönlendirme)
- [ ] SSL sertifikası (Vercel otomatik)
- [ ] Environment variables (production .env)
- [ ] Preview deployments (her push'ta)

## 9.4 — Lansman
- [ ] Shopify'dan DNS geçişi (poolemark.com → Vercel)
- [ ] 301 redirect'lerin aktif edilmesi
- [ ] Google Search Console'da yeni site doğrulama
- [ ] Sitemap.xml gönderimi
- [ ] Google Merchant Center güncelleme
- [ ] robots.txt kontrol
- [ ] Son kontroller ve canlıya alma

---

# TAMAMLANDI ✅

Site artık:
- Profesyonel e-ticaret sitesi
- SEO optimize
- Mobil uyumlu
- Güvenli ödeme (PayTR)
- Admin panel ile tam kontrol
- E-posta bildirimleri (Resend)
- Vercel'de barınıyor
- poolemark.com'a bağlı
