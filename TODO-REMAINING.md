# Kalan İşler (Eve Gidince)

Bugünkü oturumda 9 madde tamamlandı. Aşağıdakiler bekliyor.

## Öncelikli — DB / Backend Aksiyonu Gerekli

### Stoğa girince haber ver — migration uygulama
- Dosya: `supabase/migrations/20260423000015_stock_notifications.sql`
- Henüz remote'a `db push` edilmedi. Sunucu açılmadan önce uygula:
  ```powershell
  npx supabase db push
  ```
- Tablo: `stock_notifications` (RLS ile insert anonim, select/update sadece admin).

### Aras → Kolay Gelsin migration başarısız
- Dosya: `supabase/migrations/20260423000014_aras_to_kolaygelsin.sql`
- `npx supabase db execute --file ...` exit 1 verdi. Hata mesajına bakıp düzeltilecek.

---

## 7. Ürün Karşılaştırma — ATLANDI
PVC paneller için ROI düşük (her kategoride farklı attribute). "Son Gezdikleriniz" + "Benzer Ürünler" zaten bu ihtiyacı büyük ölçüde karşılıyor. Talep gelirse yapılır.

---

## 10. Footer Bülten Kaydı + Welcome Mail
- `src/app/api/newsletter/route.ts` mevcut. Kayıt sonrası welcome maili + hoş geldin kuponu YOK.
- Yapılacak:
  - `src/components/emails/newsletter-welcome.tsx` (yeni — hoş geldin + kupon kodu)
  - `route.ts` içinde başarılı insert sonrası `resend.emails.send(...)` çağrısı
  - Footer'a NewsletterForm yerleştirilmesi (eğer yoksa — şu an sadece home'da var)
- Kupon stratejisi: Tek seferlik `HOSGELDIN10` (exit-intent'tekiyle aynı) veya kullanıcıya özel üretilen kod.

## 11. Bildirim Tercihleri (Hesabım)
- DB: `profiles` tablosuna `notification_preferences jsonb default '{"order":true,"marketing":true,"stock":true}'::jsonb`
- Migration: `supabase/migrations/20260424000001_profile_notification_prefs.sql`
- Sayfa: `src/app/(store)/hesabim/bildirimler/page.tsx`
- Hesabım sidebar/menüsüne link
- `src/components/emails/*` gönderim noktalarında preference kontrolü ekle

## 12. Skeleton Loader Tutarlılığı
- Audit: spinner kullanan tüm sayfalar
  - `src/app/(store)/hesabim/**/loading.tsx` var mı kontrol
  - `src/app/(store)/blog/loading.tsx`, `urunler/loading.tsx`, `kategori/[slug]/loading.tsx`
- Skeleton bileşenini kullanarak loaded layout'a uygun shimmer

## 13. 404 Kişiselleştir
- `src/app/not-found.tsx` güncelle:
  - Popüler kategori chip'leri (Top 6)
  - Arama kutusu (`/arama` redirect)
  - "Ana sayfaya dön" + "Tüm ürünler" CTA

## 14. Erişilebilirlik (A11y)
- `src/app/layout.tsx`'e skip-link:
  ```tsx
  <a href="#main" className="sr-only focus:not-sr-only ...">İçeriğe atla</a>
  ```
- `<main id="main">` ekle (store layout)
- Form hata kapsayıcılarına `aria-live="polite"`
- `:focus-visible` ring tutarlılığı (Button/Input/Link)
- Modal'larda focus trap (exit-intent, mini-cart kontrol)
- Image alt'larının anlamlı olduğunu doğrula

## 15. Sticky Filter Bar (Kategori)
- `src/app/(store)/kategori/[slug]/page.tsx`
- Sıralama + ürün sayısı içeren toolbar'ı `sticky top-[68px] z-30 bg-background/95 backdrop-blur` ile sabitle
- Mobilde "Filtrele" butonu da sticky

## 16. Sentry / Error Tracking
- `npm i @sentry/nextjs`
- `npx @sentry/wizard@latest -i nextjs`
- DSN env: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- next.config.ts'i `withSentryConfig` ile sar

## 17. Lighthouse CI
- `.github/workflows/lighthouse.yml`
- `.lighthouserc.json`:
  ```json
  {
    "ci": {
      "collect": { "url": ["http://localhost:3000/", "http://localhost:3000/urunler"] },
      "assert": { "preset": "lighthouse:recommended" }
    }
  }
  ```

## 18. useCart Sertleştirme (Hydration Safe)
- `src/hooks/use-cart.tsx` audit:
  - localStorage okuma `useEffect` içinde olmalı
  - `mounted` flag döndür
  - SSR sırasında `items: []` döndür
- `MiniCart` ve `CartPage`'de `mounted` false iken skeleton göster

## 19. Playwright Kritik Akış Testleri
- `npm i -D @playwright/test`
- `npx playwright install chromium`
- `playwright.config.ts`
- `tests/checkout-flow.spec.ts`:
  1. Anasayfa → ürün detay
  2. Sepete ekle
  3. /sepet doğrula
  4. /checkout misafir form doldur
  5. Ödeme intent (mock) → başarı sayfası
- `tests/auth.spec.ts`: kayıt + giriş + şifre sıfırlama
- `tests/admin.spec.ts`: admin login + ürün listele

## 20. Canlı Ziyaretçi Sayacı (Admin Panel) — ÜCRETSİZ
**Yaklaşım:** Supabase Realtime Presence API (DB yazımı sıfır, mevcut plan yeterli — $0)

- Tüm store sayfalarında client component: `<PresenceTracker />`
  - Supabase channel'a join: `supabase.channel('online-visitors', { config: { presence: { key: sessionId } } })`
  - `track({ path, userId, joinedAt })` ile presence sync
  - Route değiştiğinde update, unmount'ta untrack
- Admin sayfası: `src/app/admin/canli-ziyaretciler/page.tsx`
  - Aynı channel'a join
  - `presenceState()` ile aktif liste; toplam sayı, sayfa bazında dağılım, üye/misafir oranı
  - Realtime güncelleme (her sync/leave'de re-render)
- Layout konumlandırma:
  - `(store)/layout.tsx`'e `<PresenceTracker />` ekle
  - Admin sidebar'a "Canlı Ziyaretçi" linki + canlı sayı badge

**Opsiyonel ek (sonra):** günlük özet için `visitor_stats_hourly` tablosu — saatlik snapshot cron'u (anlık sayım için gerekmez).

---

## 21. PWA (Sonra)
- `next-pwa` veya manuel service worker
- `manifest.json`, ikonlar
- Offline fallback sayfası
- Add to Home Screen prompt

---

## Bugün Tamamlanan (Referans)

1. ✅ Product JSON-LD (offer + rating)
2. ✅ Article JSON-LD (blog detay)
3. ✅ Görsel optimizasyonu — ProductCard `priority` (ilk 4)
4. ✅ Stoğa girince haber ver — DB + API + UI (migration push edilmedi)
5. ✅ Mini-cart ücretsiz kargo progress bar (zaten vardı, doğrulandı)
6. ✅ Son gezilen ürünler — `use-recent-products` hook + tracker + liste
7. ⏭️ Ürün karşılaştırma — atlandı
8. ✅ Sepete eklerken feedback — toast'a "Sepete Git" action
9. ✅ Exit-intent kupon popup — `HOSGELDIN10`
