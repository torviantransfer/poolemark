import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/store/product-card";
import { NewsletterForm } from "@/components/store/newsletter-form";
import { TrustBadges } from "@/components/store/trust-badges";
import {
  ArrowRight,
  Sparkles,
  Home,
  Star,
  BadgeCheck,
  ShieldCheck,
  Zap,
  ChevronDown,
  Quote,
  Truck,
  RotateCcw,
  CreditCard,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poolemark | Ev Gereçleri & Dekorasyon",
  description:
    "Evinizi güzelleştiren kaliteli ürünler. Mutfak gereçleri, banyo aksesuarları, dekorasyon ürünleri ve daha fazlası Poolemark'ta.",
};

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch banners, categories, featured products, new products, blog posts in parallel
  const [bannersRes, categoriesRes, featuredRes, newProductsRes, blogRes] =
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
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
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
        .select("id, title, slug, excerpt, image_url, created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  const banners = bannersRes.data || [];
  const categories = categoriesRes.data || [];
  const featuredProducts = (featuredRes.data || []) as Product[];
  const newProducts = (newProductsRes.data || []) as Product[];
  const blogPosts = blogRes.data || [];
  const activeBanner = banners[0];

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden -mt-16 md:-mt-[68px]">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          {activeBanner?.image_url ? (
            <Image
              src={activeBanner.image_url}
              alt={activeBanner.title || "Poolemark"}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/80 to-primary/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>2018&apos;den bu yana güvenilir alışveriş</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
              {activeBanner?.title || (
                <>
                  Evinizi{" "}
                  <span className="text-primary">
                    Güzelleştirin
                  </span>
                </>
              )}
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-8 max-w-lg">
              {activeBanner?.description ||
                "Mutfak, banyo, dekorasyon ve daha fazlası. Kaliteli ürünlerle yaşam alanlarınızı yenileyin."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                  render={
                    <Link
                      href={activeBanner?.link_url || "/products"}
                    />
                  }
                size="lg"
                className="text-base px-8 h-12 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
              >
                Ürünleri Keşfet
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                render={<Link href="/hakkimizda" />}
                variant="outline"
                size="lg"
                className="text-base px-8 h-12 border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Bizi Tanıyın
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BADGES ===== */}
      <TrustBadges />

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
                  Ne Arıyorsunuz?
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
                    <Home className="h-7 w-7" />
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

      {/* ===== FEATURED PRODUCTS ===== */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                  Öne Çıkanlar
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  En Beğenilen Ürünler
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
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== PROMO BANNER ===== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground via-foreground/80 to-primary/40 p-8 md:p-14 lg:p-20">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)]" />
            </div>
            <div className="relative z-10 max-w-xl">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                Yeni Sezon
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
                Yaşam Alanlarınıza
                <br />
                <span className="text-primary">
                  Taze Bir Dokunuş
                </span>
              </h2>
              <p className="text-white/60 text-lg mb-8">
                Yeni sezon ürünlerimizle evinizi yenileyin. Şık, fonksiyonel ve
                uygun fiyatlı seçenekler sizi bekliyor.
              </p>
              <Button
                  render={<Link href="/products" />}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 h-12 px-8 text-base"
              >
                Koleksiyonu Keşfet
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEW PRODUCTS ===== */}
      {newProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                  Yeni Eklenenler
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  En Yeni Ürünler
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
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== WHY POOLEMARK ===== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text */}
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                Neden Biz?
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Poolemark Farkı
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                2018&apos;den bu yana ev gereçleri ve dekorasyon alanında binlerce müşterimize güvenle hizmet veriyoruz. Kaliteli ürünler, hızlı teslimat ve müşteri memnuniyeti odaklı yaklaşımımızla sektörde fark yaratıyoruz.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Türkiye&apos;nin 81 iline hızlı kargo, koşulsuz ücretsiz iade ve 12 taksit imkanı ile alışverişi keyifli hale getiriyoruz. Müşterilerimizin %98&apos;i bizi tavsiye ediyor.
              </p>
              <Button
                render={<Link href="/hakkimizda" />}
                size="lg"
                className="h-12 px-8 text-base bg-primary hover:bg-primary/90 text-white"
              >
                Daha Fazla Bilgi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Right: Icon cards grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: BadgeCheck,
                  title: "Kalite Garantisi",
                  desc: "Her ürün titizlikle kontrol edilir",
                  stat: "10.000+",
                  statLabel: "Mutlu müşteri",
                },
                {
                  icon: Zap,
                  title: "Aynı Gün Kargo",
                  desc: "14:00'a kadar verilen siparişler",
                  stat: "14:00",
                  statLabel: "Son sipariş saati",
                },
                {
                  icon: Star,
                  title: "%98 Memnuniyet",
                  desc: "Müşterilerimiz bizi tavsiye ediyor",
                  stat: "4.9/5",
                  statLabel: "Ortalama puan",
                },
                {
                  icon: ShieldCheck,
                  title: "Güvenli Ödeme",
                  desc: "256-bit SSL ve 3D Secure",
                  stat: "PCI DSS",
                  statLabel: "Sertifikalı altyapı",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-5 md:p-6 rounded-2xl border border-border/30 bg-gradient-to-b from-secondary/50 to-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
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

      {/* ===== NEWSLETTER ===== */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm mb-6">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Fırsatları Kaçırmayın
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
              Yeni ürünler, özel indirimler ve kampanyalardan ilk siz haberdar
              olun. Abone olanlara özel %10 indirim!
            </p>
            <NewsletterForm variant="hero" />
            <p className="text-xs text-white/40 mt-4">
              Dilediğiniz zaman abonelikten çıkabilirsiniz. Gizliliğinize saygı
              duyuyoruz.
            </p>
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
                  Blog
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Son Yazılarımız
                </h2>
              </div>
              <Link
                href="/blog"
                className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Tümünü Gör
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
                    {post.image_url && (
                      <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="p-5 md:p-6">
                    <time className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString("tr-TR", {
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
          </div>
        </section>
      )}

      {/* ===== CUSTOMER REVIEWS ===== */}
      <section className="py-16 md:py-24 bg-secondary/30">
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
              <span className="ml-2 text-sm font-semibold text-foreground">4.9 / 5</span>
              <span className="text-sm text-muted-foreground ml-1">(200+ değerlendirme)</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: "Ayşe K.", city: "İstanbul", rating: 5, text: "Sipariş ettiğim ürünler çok hızlı geldi, kalitesi harika. Ambalajlama da çok özenli, kesinlikle tavsiye ederim. Tekrar alışveriş yapacağım.", date: "2026-03-15" },
              { name: "Mehmet T.", city: "Ankara", rating: 5, text: "Fiyat-performans olarak çok iyi. 12 taksit imkanı da cabası. Müşteri hizmetleri çok ilgili, soruma anında dönüş yaptılar.", date: "2026-03-10" },
              { name: "Zeynep A.", city: "İzmir", rating: 5, text: "İade sürecim çok kolay oldu, hiç uğraştırmadılar. Kargo kodu hemen geldi, ücretsiz iade gerçekten ücretsiz. Teşekkürler Poolemark!", date: "2026-02-28" },
              { name: "Fatma Y.", city: "Antalya", rating: 5, text: "Dekorasyon ürünleri tam beklediğim gibi çıktı. Renk ve kalite web sitesindeki fotoğraflarla birebir aynı. Çok memnunum.", date: "2026-02-20" },
              { name: "Ali R.", city: "Bursa", rating: 5, text: "Hafta içi 14:00'dan önce sipariş verdim, aynı gün kargoya verildi. Ertesi gün elimdeydi. Bu hız gerçekten takdire şayan!", date: "2026-02-15" },
              { name: "Elif S.", city: "Konya", rating: 4, text: "Ürünlerin kalitesi çok iyi. Mutfak gereçlerini aldım, günlük kullanımda mükemmel. Fiyatları da gayet makul.", date: "2026-01-30" },
              { name: "Hakan D.", city: "Trabzon", rating: 5, text: "Güvenli ödeme sistemi ile gönül rahatlığıyla alışveriş yaptım. 3D Secure ile ödeme yaptım, hiçbir sorun yaşamadım.", date: "2026-01-22" },
              { name: "Selin M.", city: "Eskişehir", rating: 5, text: "Banyo aksesuarları harika! Montajı kolay, görüntüsü şık. WhatsApp'tan sipariş öncesi sorularıma hemen cevap aldım.", date: "2026-01-10" },
              { name: "Burak Ç.", city: "Adana", rating: 5, text: "500₺ üzeri ücretsiz kargo gerçekten avantajlı. Ürün kalitesi de beklentimin üstünde çıktı. Poolemark'ı herkese öneriyorum.", date: "2026-01-05" },
            ].map((review, i) => (
              <article
                key={i}
                className="p-5 md:p-6 rounded-2xl bg-white border border-border/30 hover:shadow-md transition-shadow"
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
                  <span className="sr-only" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                    <meta itemProp="ratingValue" content={String(review.rating)} />
                    <meta itemProp="bestRating" content="5" />
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4" itemProp="reviewBody">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground" itemProp="author">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.city}</p>
                  </div>
                  <time className="text-xs text-muted-foreground" itemProp="datePublished" dateTime={review.date}>
                    {new Date(review.date).toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
                  </time>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              Sıkça Sorulan Sorular
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Merak Edilenler
            </h2>
            <p className="text-muted-foreground">
              Alışveriş öncesi en çok merak edilen soruların yanıtları
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {[
              { q: "Kargo ücreti ne kadar?", a: "500₺ ve üzeri tüm siparişlerde kargo ücreti tarafımızca karşılanır. 500₺ altı siparişlerde kargo ücreti sepet sayfasında belirtilir." },
              { q: "Siparişim ne zaman kargoya verilir?", a: "Hafta içi saat 14:00'a kadar verilen siparişler aynı gün, sonrası bir sonraki iş günü kargoya verilir. Cumartesi saat 11:00'e kadar verilen siparişler aynı gün kargoya verilir." },
              { q: "Teslimat süresi ne kadar?", a: "Kargoya verilen siparişleriniz 1-2 iş günü içinde adresinize teslim edilir. MNG Kargo, Yurtiçi Kargo, Sürat Kargo, Aras Kargo ve Kolay Gelsin ile çalışmaktayız." },
              { q: "Taksitli ödeme yapabilir miyim?", a: "Evet, tüm kredi kartlarına 3, 6, 9 ve 12 taksit imkanı sunuyoruz. Tüm ödemeler 256-bit SSL şifreleme ve 3D Secure ile güvence altındadır." },
              { q: "İade süreci nasıl işliyor?", a: "Ürünü teslim aldığınız tarihten itibaren 14 gün içinde ücretsiz iade edebilirsiniz. İade kargo ücreti tarafımızca karşılanır. Müşteri paneli, WhatsApp veya e-posta ile iade talebi oluşturabilirsiniz." },
              { q: "Hangi ödeme yöntemlerini kabul ediyorsunuz?", a: "Visa, Mastercard, Troy kredi kartları, banka kartları ve havale/EFT ile ödeme kabul ediyoruz. Kredi kartı bilgileriniz sunucularımızda kesinlikle saklanmaz." },
              { q: "Ürünler orijinal mi?", a: "Evet, satışa sunduğumuz tüm ürünler orijinaldir ve kalite kontrolden geçirilir. Ürünlerimiz garanti kapsamında sunulmaktadır." },
              { q: "Size nasıl ulaşabilirim?", a: "0 850 840 13 27 numaralı telefonumuzdan, WhatsApp'tan veya info@poolemark.com adresinden bize ulaşabilirsiniz. Hafta içi 09:00-18:00, Cumartesi 09:00-14:00 saatleri arasında hizmet veriyoruz." },
            ].map((faq, i) => (
              <details key={i} className="group rounded-xl border border-border/30 bg-secondary/20 overflow-hidden">
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
          <div className="text-center mt-8">
            <Button
              render={<Link href="/sss" />}
              variant="outline"
              size="lg"
              className="h-11 px-6"
            >
              Tüm Soruları Gör
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ===== FAQ + Review Structured Data ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "Kargo ücreti ne kadar?", acceptedAnswer: { "@type": "Answer", text: "500₺ ve üzeri tüm siparişlerde kargo ücreti tarafımızca karşılanır." } },
              { "@type": "Question", name: "Siparişim ne zaman kargoya verilir?", acceptedAnswer: { "@type": "Answer", text: "Hafta içi saat 14:00'a kadar verilen siparişler aynı gün kargoya verilir. Cumartesi saat 11:00'e kadar verilen siparişler aynı gün kargoya verilir." } },
              { "@type": "Question", name: "Teslimat süresi ne kadar?", acceptedAnswer: { "@type": "Answer", text: "Kargoya verilen siparişleriniz 1-2 iş günü içinde adresinize teslim edilir." } },
              { "@type": "Question", name: "Taksitli ödeme yapabilir miyim?", acceptedAnswer: { "@type": "Answer", text: "Evet, tüm kredi kartlarına 3, 6, 9 ve 12 taksit imkanı sunuyoruz." } },
              { "@type": "Question", name: "İade süreci nasıl işliyor?", acceptedAnswer: { "@type": "Answer", text: "Ürünü teslim aldığınız tarihten itibaren 14 gün içinde ücretsiz iade edebilirsiniz. İade kargo ücreti tarafımızca karşılanır." } },
              { "@type": "Question", name: "Hangi ödeme yöntemlerini kabul ediyorsunuz?", acceptedAnswer: { "@type": "Answer", text: "Visa, Mastercard, Troy kredi kartları, banka kartları ve havale/EFT ile ödeme kabul ediyoruz." } },
              { "@type": "Question", name: "Ürünler orijinal mi?", acceptedAnswer: { "@type": "Answer", text: "Evet, satışa sunduğumuz tüm ürünler orijinaldir ve kalite kontrolden geçirilir." } },
              { "@type": "Question", name: "Size nasıl ulaşabilirim?", acceptedAnswer: { "@type": "Answer", text: "0 850 840 13 27 numaralı telefonumuzdan, WhatsApp'tan veya info@poolemark.com adresinden bize ulaşabilirsiniz." } },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Poolemark",
            image: "https://poolemark.com/logo.png",
            url: "https://poolemark.com",
            telephone: "+908508401327",
            email: "info@poolemark.com",
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
          }),
        }}
      />
    </>
  );
}
