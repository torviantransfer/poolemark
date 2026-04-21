import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/store/product-card";
import { NewsletterForm } from "@/components/store/newsletter-form";
import { TrustBadges } from "@/components/store/trust-badges";
import {
  ArrowRight,
  Sparkles,
  Star,
  BadgeCheck,
  ShieldCheck,
  Zap,
  ChevronDown,
  Truck,
  LayoutGrid,
  Paintbrush,
  Droplets,
  Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product, Review } from "@/types";

export default async function HomePage() {
  const supabase = await createClient();

  const [bannersRes, categoriesRes, productsRes, blogRes, reviewsRes, reviewStatsRes] =
    await Promise.all([
      supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .limit(8),
      supabase
        .from("products")
        .select(
          "*, category:categories(id, name, slug), images:product_images(*)"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image_url, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3),
      supabase
        .from("reviews")
        .select("*, user:users!user_id(first_name, last_name)")
        .eq("is_approved", true)
        .gte("rating", 4)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("reviews")
        .select("rating")
        .eq("is_approved", true),
    ]);

  const banners = bannersRes.data || [];
  const categories = categoriesRes.data || [];
  const products = (productsRes.data || []) as Product[];
  const blogPosts = blogRes.data || [];
  const activeBanner = banners[0];
  const reviews = (reviewsRes.data || []) as Review[];
  const allRatings = reviewStatsRes.data || [];
  const reviewCount = allRatings.length;
  const reviewAvg = reviewCount > 0
    ? (allRatings.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviewCount).toFixed(1)
    : "4.9";

  function getReviewerDisplayName(review: Review): string {
    if (review.user?.first_name) {
      const last = review.user.last_name;
      return `${review.user.first_name}${last ? " " + last[0] + "." : ""}`;
    }
    if (review.reviewer_name) return review.reviewer_name;
    return "Müşteri";
  }

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden -mt-16 md:-mt-[68px]">
        <div className="absolute inset-0 z-0">
          <Image
            src={activeBanner?.image_url || "/hero-banner.jpg"}
            alt={activeBanner?.title || "PVC Duvar Paneli ve Mermer Folyo - Poolemark"}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Kırmadan Dökmeden Pratik Ev Yenileme</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
              {activeBanner?.title || (
                <>
                  Duvarlarınıza{" "}
                  <span className="text-primary">Yeni Hayat</span> Verin
                </>
              )}
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-lg">
              {activeBanner?.subtitle ||
                "Yapışkanlı PVC duvar paneli ve mermer folyo ile banyo, mutfak ve salonunuzu usta çağırmadan yenileyin."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                render={
                  <Link href={activeBanner?.link_url || "/products"} />
                }
                size="lg"
                className="text-base px-8 h-12 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
              >
                Ürünleri İncele
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                render={<Link href="/blog" />}
                size="lg"
                className="text-base px-8 h-12 bg-white/10 border border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                Uygulama Rehberleri
              </Button>
            </div>

            {/* Mini trust indicators */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 text-white/60 text-sm">
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4" /> 500₺ Üzeri Ücretsiz Kargo
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Güvenli Ödeme
              </span>
              <span className="flex items-center gap-1.5">
                <Scissors className="h-4 w-4" /> Kolay Uygulama
              </span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/50" aria-hidden="true" />
        </div>
      </section>

      {/* ===== TRUST BADGES ===== */}
      <TrustBadges />

      {/* ===== PRODUCTS ===== */}
      {products.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                  Ürünlerimiz
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Duvar Paneli ve Folyo Çözümleri
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Tümünü Gör
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Button render={<Link href="/products" />} variant="outline" size="lg" className="h-11 px-6">
                Tüm Ürünleri Gör
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              Nasıl Uygulanır?
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              3 Adımda Duvarlarınızı Yenileyin
            </h2>
            <p className="text-muted-foreground">
              Usta çağırmanıza gerek yok. Kendiniz kolayca uygulayabilirsiniz.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                step: "01",
                icon: Scissors,
                title: "Ölçün ve Kesin",
                desc: "Kaplayacağınız alanı ölçün, paneli veya folyoyu maket bıçağıyla kolayca kesin.",
              },
              {
                step: "02",
                icon: Droplets,
                title: "Yüzeyi Temizleyin",
                desc: "Uygulama yapacağınız yüzeyi temizleyip kurulayın. Fayans, boya veya düz duvar üzerine uygulanır.",
              },
              {
                step: "03",
                icon: Paintbrush,
                title: "Yapıştırın, Bitti!",
                desc: "Koruyucu kağıdı soyun, yüzeye yerleştirin ve bastırın. İşlem tamam — sonuç anında görülür.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-6 md:p-8 rounded-2xl bg-white border border-border/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <span className="absolute top-4 right-4 text-5xl font-black text-primary/10">
                  {item.step}
                </span>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mx-auto mb-5">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
      {categories.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                  Kategoriler
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  İhtiyacınıza Göre Seçin
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Tümünü Gör
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  className="group relative flex flex-col items-center p-6 md:p-8 rounded-2xl bg-gradient-to-b from-secondary to-white border border-border/30 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                    {cat.image_url ? (
                      <Image src={cat.image_url} alt={cat.name} width={40} height={40} className="rounded-lg object-cover" />
                    ) : (
                      <LayoutGrid className="h-7 w-7" />
                    )}
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-foreground text-center">
                    {cat.name}
                  </h3>
                  {cat.product_count > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {cat.product_count} ürün
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== PROMO BANNER — Product-focused ===== */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground via-foreground/80 to-primary/40 p-8 md:p-14 lg:p-20">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)]" />
            </div>
            <div className="relative z-10 max-w-xl">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                Kiracılara Özel
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
                Kırmadan Dökmeden
                <br />
                <span className="text-primary">Ev Yenileme</span>
              </h2>
              <p className="text-white/60 text-lg mb-4">
                Yapışkanlı PVC paneller ve folyolar söküldüğünde iz bırakmaz. Kiralık evinizi istediğiniz gibi yenileyin, taşınırken orijinal haline geri döndürün.
              </p>
              <ul className="space-y-2 text-white/50 text-sm mb-8">
                <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary shrink-0" /> Fayans üstüne direkt uygulanır</li>
                <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary shrink-0" /> Suya ve ısıya dayanıklı PVC malzeme</li>
                <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary shrink-0" /> Söküldüğünde yüzeyde iz bırakmaz</li>
              </ul>
              <Button
                render={<Link href="/blog/kiraci-dostu-ev-yenileme-rehberi" />}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 h-12 px-8 text-base"
              >
                Rehberi Oku
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CUSTOMER REVIEWS ===== */}
      {(reviews.length > 0 || reviewCount === 0) && (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              Müşteri Yorumları
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Müşterilerimiz Ne Diyor?
            </h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-5 w-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              ))}
              <span className="ml-2 text-sm font-semibold text-foreground">{reviewAvg} / 5</span>
              {reviewCount > 0 && (
                <span className="text-sm text-muted-foreground ml-1">({reviewCount}+ değerlendirme)</span>
              )}
            </div>
          </div>
          {reviews.length > 0 ? (
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none scrollbar-hide pb-4 md:pb-0 -mx-4 md:mx-0 px-4 md:px-0">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="shrink-0 w-[82vw] sm:w-[60vw] md:w-auto snap-start p-5 md:p-6 rounded-2xl bg-secondary/20 border border-border/30 hover:shadow-md transition-shadow"
                  itemScope
                  itemType="https://schema.org/Review"
                >
                  <meta itemProp="itemReviewed" content="Poolemark" />
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }, (_, s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s < review.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`}
                        aria-hidden="true"
                      />
                    ))}
                    {review.is_verified_purchase && (
                      <span className="ml-auto text-[10px] font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                        Doğrulanmış
                      </span>
                    )}
                    <span className="sr-only" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                      <meta itemProp="ratingValue" content={String(review.rating)} />
                      <meta itemProp="bestRating" content="5" />
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-4" itemProp="reviewBody">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground" itemProp="author">
                      {getReviewerDisplayName(review)}
                    </p>
                    <time className="text-xs text-muted-foreground" itemProp="datePublished" dateTime={review.created_at}>
                      {new Date(review.created_at).toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>
      )}

      {/* ===== WHY POOLEMARK ===== */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                Neden Poolemark?
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Duvar Paneli ve Folyo&apos;da Güvenilir Adres
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                2018&apos;den bu yana yapışkanlı PVC duvar paneli, 3D tuğla paneli ve mermer folyo alanında Türkiye genelinde binlerce müşteriye hizmet veriyoruz. Ürünlerimiz suya dayanıklı, kolay uygulanabilir ve söküldüğünde iz bırakmaz.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Türkiye&apos;nin 81 iline aynı gün kargo, 14 gün koşulsuz ücretsiz iade ve 12 taksit imkanı sunuyoruz. Hangi ürünün alanınıza uygun olduğunu bilmiyorsanız blog rehberlerimize göz atın.
              </p>
              <Button
                render={<Link href="/hakkimizda" />}
                size="lg"
                className="h-12 px-8 text-base bg-primary hover:bg-primary/90 text-white"
              >
                Hakkımızda
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: BadgeCheck,
                  title: "Suya Dayanıklı",
                  desc: "PVC malzeme mutfak ve banyoda güvenle kullanılır",
                  stat: "100%",
                  statLabel: "Su geçirmez",
                },
                {
                  icon: Zap,
                  title: "Aynı Gün Kargo",
                  desc: "14:00'a kadar verilen siparişler aynı gün kargoda",
                  stat: "14:00",
                  statLabel: "Son sipariş saati",
                },
                {
                  icon: Star,
                  title: "Kolay Uygulama",
                  desc: "Kes-yapıştır sistemiyle kendiniz uygulayın",
                  stat: "10dk",
                  statLabel: "Ortalama uygulama",
                },
                {
                  icon: ShieldCheck,
                  title: "İz Bırakmaz",
                  desc: "Söküldüğünde altındaki yüzeye zarar vermez",
                  stat: "0",
                  statLabel: "Kalıntı izi",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-5 md:p-6 rounded-2xl border border-border/30 bg-gradient-to-b from-white to-secondary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 mb-4">
                    <item.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-0.5">{item.stat}</p>
                  <p className="text-xs text-muted-foreground mb-3">{item.statLabel}</p>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOG ===== */}
      {blogPosts.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                  Uygulama Rehberleri
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Panel ve Folyo Rehberleri
                </h2>
              </div>
              <Link
                href="/blog"
                className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Tüm Yazılar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-2xl overflow-hidden border border-border/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                    {post.cover_image_url && (
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="p-5 md:p-6">
                    <time className="text-xs text-muted-foreground">
                      {new Date(post.published_at).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                    <h3 className="text-base font-semibold text-foreground mt-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Button render={<Link href="/blog" />} variant="outline" size="lg" className="h-11 px-6">
                Tüm Yazıları Gör
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ===== FAQ ===== */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              Sıkça Sorulan Sorular
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Merak Edilenler
            </h2>
            <p className="text-muted-foreground">
              Duvar paneli ve folyo hakkında en çok sorulan sorular
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {[
              { q: "Yapışkanlı panel fayans üzerine uygulanabilir mi?", a: "Evet, temiz ve kuru fayans yüzeyine doğrudan uygulanabilir. Derz boşlukları 1-2 mm ise panel rahatlıkla kapatır. Uygulama öncesi yüzeyi yağ çözücüyle temizlemeniz yeterlidir." },
              { q: "Panel ve folyo söküldüğünde iz bırakır mı?", a: "Kaliteli yapışkanlı ürünler, 18 aya kadar iz bırakmadan sökülebilir. Daha uzun süre kaldıysa fön makinesiyle ısıtarak sökmeniz ve varsa hafif kalıntıyı sirkeli bezle silmeniz yeterlidir." },
              { q: "Banyo ve mutfakta suya dayanıklı mı?", a: "Evet, PVC malzeme %100 su geçirmezdir. Panel ve folyonun kendisi suya dayanıklıdır. Kenar birleşim noktalarına şeffaf silikon uygulamanız uzun ömürlü kullanım sağlar." },
              { q: "Kargo ücreti ne kadar?", a: "500₺ ve üzeri tüm siparişlerde kargo ücreti tarafımızca karşılanır. 500₺ altı siparişlerde kargo ücreti sepet sayfasında belirtilir." },
              { q: "Siparişim ne zaman kargoya verilir?", a: "Hafta içi saat 14:00'a kadar verilen siparişler aynı gün kargoya verilir. Sonrasında verilen siparişler bir sonraki iş günü kargoya verilir." },
              { q: "Taksitli ödeme yapabilir miyim?", a: "Evet, tüm kredi kartlarına 3, 6, 9 ve 12 taksit imkanı sunuyoruz. Tüm ödemeler 256-bit SSL şifreleme ve 3D Secure ile güvence altındadır." },
              { q: "İade süreci nasıl işliyor?", a: "Ürünü teslim aldığınız tarihten itibaren 14 gün içinde ücretsiz iade edebilirsiniz. İade kargo ücreti tarafımızca karşılanır." },
              { q: "Kaç m² panel gerektiğini nasıl hesaplarım?", a: "Kaplanacak alanın genişliğini ve yüksekliğini çarpın (m²). Sonucu panel alanına (örn. 60x30cm = 0.18 m²) bölün. %10-15 fire payı ekleyin. Detaylı hesaplama rehberimiz blogumuzda mevcut." },
            ].map((faq, i) => (
              <details key={i} className="group rounded-xl border border-border/30 bg-white overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left text-sm font-semibold text-foreground hover:bg-secondary/50 transition-colors list-none [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm mb-6">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Fırsatları Kaçırmayın
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
              Yeni ürünler, uygulama ipuçları ve kampanyalardan ilk siz haberdar olun.
            </p>
            <NewsletterForm variant="hero" />
            <p className="text-xs text-white/40 mt-4">
              Dilediğiniz zaman abonelikten çıkabilirsiniz. Gizliliğinize saygı duyuyoruz.
            </p>
          </div>
        </div>
      </section>

      {/* ===== STRUCTURED DATA ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "Yapışkanlı panel fayans üzerine uygulanabilir mi?", acceptedAnswer: { "@type": "Answer", text: "Evet, temiz ve kuru fayans yüzeyine doğrudan uygulanabilir." } },
              { "@type": "Question", name: "Panel ve folyo söküldüğünde iz bırakır mı?", acceptedAnswer: { "@type": "Answer", text: "Kaliteli yapışkanlı ürünler, 18 aya kadar iz bırakmadan sökülebilir." } },
              { "@type": "Question", name: "Banyo ve mutfakta suya dayanıklı mı?", acceptedAnswer: { "@type": "Answer", text: "Evet, PVC malzeme %100 su geçirmezdir." } },
              { "@type": "Question", name: "Kargo ücreti ne kadar?", acceptedAnswer: { "@type": "Answer", text: "500₺ ve üzeri tüm siparişlerde kargo ücreti tarafımızca karşılanır." } },
              { "@type": "Question", name: "Siparişim ne zaman kargoya verilir?", acceptedAnswer: { "@type": "Answer", text: "Hafta içi saat 14:00'a kadar verilen siparişler aynı gün kargoya verilir." } },
              { "@type": "Question", name: "Taksitli ödeme yapabilir miyim?", acceptedAnswer: { "@type": "Answer", text: "Evet, tüm kredi kartlarına 3, 6, 9 ve 12 taksit imkanı sunuyoruz." } },
              { "@type": "Question", name: "İade süreci nasıl işliyor?", acceptedAnswer: { "@type": "Answer", text: "Ürünü teslim aldığınız tarihten itibaren 14 gün içinde ücretsiz iade edebilirsiniz." } },
              { "@type": "Question", name: "Kaç m² panel gerektiğini nasıl hesaplarım?", acceptedAnswer: { "@type": "Answer", text: "Kaplanacak alanın genişliğini ve yüksekliğini çarpın (m²). Sonucu panel alanına bölün ve %10-15 fire payı ekleyin." } },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: "Poolemark",
            image: "https://poolemark.com/logo.png",
            url: "https://poolemark.com",
            telephone: "+908508401327",
            email: "info@poolemark.com",
            description: "PVC duvar paneli, 3D tuğla panel ve mermer desenli yapışkanlı folyo. Kırmadan dökmeden ev yenileme çözümleri.",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Sedir Mahallesi, NO:18",
              addressLocality: "Muratpaşa",
              addressRegion: "Antalya",
              addressCountry: "TR",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "200",
              bestRating: "5",
              worstRating: "1",
            },
            openingHoursSpecification: [
              { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
              { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "14:00" },
            ],
            priceRange: "₺₺",
          }),
        }}
      />
    </>
  );
}
