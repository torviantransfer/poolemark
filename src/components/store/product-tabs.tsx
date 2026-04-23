"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

const REVIEWS_PER_PAGE = 10;


function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").slice(0, 2).join("");
}

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "xs" }) {
  const cls = size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn(cls, i < rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted")} />
      ))}
    </div>
  );
}

function RatingSummary({ reviews }: { reviews: Review[] }) {
  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const dist = [5, 4, 3, 2, 1].map((s) => ({ star: s, n: reviews.filter((r) => r.rating === s).length }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
      {/* Average */}
      <div className="flex flex-col items-center justify-center bg-white border border-border/50 rounded-2xl p-5">
        <span className="text-5xl font-bold text-foreground">{avg.toFixed(1)}</span>
        <div className="flex items-center gap-0.5 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn("h-5 w-5", i < Math.round(avg) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted")} />
          ))}
        </div>
        <span className="text-sm text-muted-foreground mt-1.5">{count} Yorumlar</span>
      </div>

      {/* Distribution */}
      <div className="bg-white border border-border/50 rounded-2xl p-5 space-y-2">
        {dist.map(({ star, n }) => (
          <div key={star} className="flex items-center gap-2 text-sm">
            <span className="w-4 text-right text-muted-foreground font-medium">{star}</span>
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
            <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full"
                style={{ width: count > 0 ? `${(n / count) * 100}%` : "0%" }}
              />
            </div>
            <span className="w-5 text-right text-muted-foreground text-xs">{n}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

function ReviewList({ reviews }: { reviews: Review[] }) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [perPage, setPerPage] = useState(10);
  const [lightbox, setLightbox] = useState<{ urls: string[]; idx: number } | null>(null);

  const sorted = [...reviews].sort((a, b) => {
    if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sort === "highest") return b.rating - a.rating;
    return a.rating - b.rating;
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const paged = sorted.slice((page - 1) * perPage, page * perPage);

  function changePage(p: number) {
    setPage(p);
    document.getElementById("degerlendirmeler")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <RatingSummary reviews={reviews} />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as typeof sort); setPage(1); }}
            className="h-9 px-3 pr-8 text-sm border border-border rounded-lg bg-white appearance-none cursor-pointer"
          >
            <option value="newest">En Son</option>
            <option value="oldest">En Eski</option>
            <option value="highest">En Yüksek</option>
            <option value="lowest">En Düşük</option>
          </select>
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="h-9 px-3 pr-8 text-sm border border-border rounded-lg bg-white appearance-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Pagination top */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => changePage(Math.max(1, page - 1))} disabled={page === 1}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-secondary">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 h-8 flex items-center text-sm border border-border rounded-lg bg-white">Sayfa {page}</span>
            <button onClick={() => changePage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-secondary">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Review grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {paged.map((review) => {
          const displayName = review.reviewer_name
            ? maskName(review.reviewer_name)
            : review.user
            ? maskName(`${review.user.first_name} ${review.user.last_name}`)
            : "Müşteri";
          const initials = getInitials(displayName.replace(/\*/g, ""));
          const photos = (review.photo_urls ?? []).filter(Boolean);

          return (
            <div key={review.id} className="bg-white border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              {/* Photo */}
              {photos[0] && (
                <button
                  onClick={() => setLightbox({ urls: photos, idx: 0 })}
                  className="relative w-full aspect-[4/3] overflow-hidden block"
                >
                  <Image src={photos[0]} alt="Yorum fotoğrafı" fill sizes="(max-width:640px)100vw,(max-width:1024px)50vw,25vw" className="object-cover hover:scale-105 transition-transform duration-300" />
                  {photos.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">+{photos.length - 1}</span>
                  )}
                </button>
              )}

              {/* Body */}
              <div className="p-3.5 flex flex-col flex-1">
                {/* Avatar + name */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-sm font-semibold text-foreground truncate">{displayName}</span>

                    </div>
                    <span className="text-[11px] text-muted-foreground">{formatDate(review.created_at)}</span>
                  </div>
                </div>

                {/* Stars + verified */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <StarRow rating={review.rating} />
                  {review.is_verified_purchase && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-700">
                      <ShieldCheck className="h-3 w-3" />
                      Doğrulanmış Satın Alma
                    </span>
                  )}
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm text-foreground/80 leading-relaxed line-clamp-4 flex-1">{review.comment}</p>
                )}

                {/* Admin reply */}
                {review.admin_reply && (
                  <div className="mt-2.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                    <span className="text-[10px] font-semibold text-blue-600 block mb-0.5">PooleMark · Satıcı Cevabı</span>
                    <p className="text-xs text-blue-800 leading-relaxed">{review.admin_reply}</p>
                  </div>
                )}

                {/* Extra photos (thumbnails) */}
                {photos.length > 1 && (
                  <div className="flex gap-1.5 mt-2.5">
                    {photos.slice(1, 4).map((url, idx) => (
                      <button key={idx} onClick={() => setLightbox({ urls: photos, idx: idx + 1 })}
                        className="relative w-12 h-12 rounded-lg overflow-hidden border border-border/50 shrink-0">
                        <Image src={url} alt="" fill sizes="48px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination bottom */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-8">
          <button onClick={() => changePage(Math.max(1, page - 1))} disabled={page === 1}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-secondary">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => changePage(p)}
              className={cn("w-8 h-8 rounded-lg border text-sm font-medium transition-colors",
                p === page ? "border-primary bg-primary text-white" : "border-border hover:bg-secondary")}>
              {p}
            </button>
          ))}
          <button onClick={() => changePage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-secondary">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white" onClick={() => setLightbox(null)}>✕</button>
          {lightbox.urls.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setLightbox((l) => l && { ...l, idx: (l.idx - 1 + l.urls.length) % l.urls.length }); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setLightbox((l) => l && { ...l, idx: (l.idx + 1) % l.urls.length }); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <div className="relative w-full max-w-2xl aspect-square" onClick={(e) => e.stopPropagation()}>
            <Image src={lightbox.urls[lightbox.idx]} alt="Yorum fotoğrafı" fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

interface ProductTabsProps {
  description: string | null;
  reviews: Review[];
  productId: string;
}

type Tab = "description" | "reviews" | "shipping" | "sss";

function maskName(name: string | null | undefined): string {
  if (!name?.trim()) return "Müşteri";
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => {
      if (p.length <= 1) return p + "***";
      return p[0] + "***";
    })
    .join(" ");
}

function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setResult({ ok: false, message: "Lütfen bir puan seçin." }); return; }
    if (!comment.trim()) { setResult({ ok: false, message: "Yorum metni boş olamaz." }); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, rating, comment, order_number: orderNumber, email }),
      });
      const data = await res.json();
      setResult({ ok: res.ok, message: data.message || data.error || "Bir hata oluştu." });
      if (res.ok) { setRating(0); setComment(""); setOrderNumber(""); setEmail(""); }
    } catch {
      setResult({ ok: false, message: "Bağlantı hatası." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-secondary/30 rounded-2xl border border-border/60 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Değerlendirme Yaz</h3>
      <p className="text-xs text-muted-foreground -mt-2">
        Sadece gerçek satın alımlar değerlendirilir. Sipariş numaranız ve e-postanızla doğrulama yapılır.
      </p>

      {/* Star Rating */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Puanınız *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              className="p-0.5"
            >
              <Star className={cn("h-7 w-7 transition-colors", (hovered || rating) >= s ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted")} />
            </button>
          ))}
        </div>
      </div>

      {/* Order + Email */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Sipariş Numarası *</label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="PM-XXXXXXXX"
            required
            className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">E-posta Adresi *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="siparişteki e-posta"
            required
            className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Yorumunuz *</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Ürün hakkındaki deneyiminizi paylaşın..."
          required
          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {result && (
        <p className={cn("text-sm rounded-lg px-3 py-2", result.ok ? "bg-green-50 text-green-700 border border-green-100" : "bg-destructive/5 text-destructive border border-destructive/10")}>
          {result.message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-10 px-6 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Gönderiliyor..." : "Değerlendirmeyi Gönder"}
      </button>
    </form>
  );
}

export function ProductTabs({
  description,
  reviews,
  productId,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("description");

  useEffect(() => {
    function handleHash() {
      if (window.location.hash === "#degerlendirmeler") {
        setActiveTab("reviews");
        document
          .getElementById("degerlendirmeler")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const tabs: { id: Tab; label: string; mobileLabel: string; count?: number }[] = [
    { id: "description", label: "Ürün Açıklaması", mobileLabel: "Açıklama" },
    { id: "reviews", label: "Değerlendirmeler", mobileLabel: "Yorumlar", count: reviews.length },
    { id: "sss", label: "SSS", mobileLabel: "SSS" },
    { id: "shipping", label: "Kargo & İade", mobileLabel: "Kargo" },
  ];

  return (
    <div id="degerlendirmeler" className="mt-12 md:mt-16">
      {/* Tab Headers */}
      <div className="grid grid-cols-4 sm:flex border-b gap-1 md:gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-1.5 sm:px-4 md:px-5 py-2.5 sm:py-3 text-[11px] sm:text-sm text-center font-medium whitespace-nowrap border-b-2 rounded-t-lg transition-colors -mb-px",
              activeTab === tab.id
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            )}
          >
            <span className="sm:hidden">{tab.mobileLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs text-muted-foreground hidden sm:inline">
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-8 px-0 md:px-1">
        {activeTab === "description" && (
          <div>
            {description ? (
              <div
                className="prose prose-sm max-w-none text-foreground/90 leading-relaxed break-words prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-table:block prose-table:overflow-x-auto prose-table:max-w-full prose-iframe:max-w-full prose-iframe:aspect-video prose-iframe:w-full prose-iframe:h-auto prose-pre:overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Bu ürün için henüz açıklama eklenmemiş.
              </p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-8">
            {/* Existing reviews */}
            {reviews.length > 0 ? (
              <ReviewList reviews={reviews} />
            ) : (
              <div className="text-center py-6">
                <Star className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">Henüz değerlendirme yok</p>
                <p className="text-xs text-muted-foreground mt-1">İlk değerlendirmeyi siz yapın!</p>
              </div>
            )}

            {/* Review form */}
            <ReviewForm productId={productId} />
          </div>
        )}

        {activeTab === "sss" && (
          <div className="space-y-2.5">
            {[
              {
                q: "Siparişimi üye olmadan verebilir miyim?",
                a: "Evet, üye olmadan misafir olarak sipariş verebilirsiniz. Sipariş onayı ve kargo takip bilgileri girdiğiniz e-posta adresine iletilir.",
              },
              {
                q: "Siparişimi nasıl takip edebilirim?",
                a: "Sipariş takip sayfasından sipariş numaranız ve e-posta adresinizi girerek kargo durumunuzu anlık olarak takip edebilirsiniz. Ayrıca siparişiniz kargoya verildiğinde size SMS ve e-posta bildirimi gönderilir.",
              },
              {
                q: "Siparişim ne zaman kargoya verilir?",
                a: "Hafta içi 14:00 ve Cumartesi 11:00 öncesi verilen siparişler aynı gün, sonrasında verilen siparişler ise ilk iş günü kargoya verilir. Pazar günleri kargolama yapılmamaktadır.",
              },
              {
                q: "Teslimat süresi ne kadar?",
                a: "Kargoya verildikten sonra ortalama 1-2 iş günü içinde elinize ulaşır. Yoğun dönemlerde bu süre 3 iş gününe kadar uzayabilir.",
              },
              {
                q: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
                a: "Visa, Mastercard, Troy gibi tüm kredi ve banka kartlarıyla güvenli ödeme yapabilirsiniz. Bankanıza göre 3, 6, 9 ve 12 taksit seçenekleri mevcuttur.",
              },
              {
                q: "Ürünü iade etmek istiyorum, ne yapmalıyım?",
                a: "Teslim tarihinden itibaren 14 gün içinde, ürün kullanılmamış ve orijinal ambalajında olması koşuluyla ücretsiz iade yapabilirsiniz. İletişim sayfamızdan veya e-posta ile talebinizi iletmeniz yeterlidir.",
              },
              {
                q: "Ürün hasarlı/yanlış geldiyse ne yapmalıyım?",
                a: "Böyle bir durumda lütfen ürünü teslim aldıktan sonraki 48 saat içinde fotoğraflı olarak bize bildirin. En kısa sürede yeni ürün gönderimi veya tam iade işlemi başlatılır.",
              },
              {
                q: "500₺ ücretsiz kargo kampanyası nasıl işliyor?",
                a: "Sepetinizdeki ürünlerin toplam tutarı 500₺ ve üzeri olduğunda kargo ücretsizdir. 500₺ altı siparişlerde sabit 49,90₺ kargo ücreti uygulanır.",
              },
            ].map((item, i) => (
              <details key={i} className="group rounded-xl border border-border/60 overflow-hidden">
                <summary className="cursor-pointer list-none flex items-center justify-between px-4 py-3.5 text-sm font-medium hover:bg-secondary/40 transition-colors">
                  {item.q}
                  <svg className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 pt-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="space-y-6 text-foreground/90">
            <div className="rounded-xl border border-border/60 bg-secondary/30 p-4 md:p-5">
              <h3 className="text-base font-semibold mb-3">Kargo Bilgileri</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li>500₺ ve üzeri siparişlerde kargo ücretsizdir.</li>
                <li>500₺ altı siparişlerde kargo ücreti 49,90₺&apos;dir.</li>
                <li>Hafta içi 14:00, Cumartesi 11:00 öncesi siparişler aynı gün kargolanır.</li>
                <li>Teslimat süresi ortalama 1-2 iş günüdür.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border/60 bg-secondary/30 p-4 md:p-5">
              <h3 className="text-base font-semibold mb-3">İade & Değişim</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li>Ürünü teslim aldığınız tarihten itibaren 14 gün içinde iade edebilirsiniz.</li>
                <li>Ürün kullanılmamış ve orijinal ambalajında olmalıdır.</li>
                <li>İade kargo ücreti Poolemark tarafından karşılanır.</li>
                <li>İade onayından sonra ödeme 5-7 iş günü içinde hesabınıza yansır.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
