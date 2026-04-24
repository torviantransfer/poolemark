import { notFound } from "next/navigation";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import {
  getFeaturedProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/services/products";
import { getProductReviews, getProductRating } from "@/services/reviews";
import { ProductCard } from "@/components/store/product-card";
import { ProductDetailClient } from "@/components/store/product-detail-client";
import { ProductTabs } from "@/components/store/product-tabs";
import { InstallmentModal } from "@/components/store/installment-modal";
import { CoverageCalculator } from "@/components/store/coverage-calculator";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/shared/json-ld";
import { RecentProductTracker } from "@/components/store/recent-product-tracker";
import { RecentProducts } from "@/components/store/recent-products";
import { formatPrice, calculateDiscountPercentage } from "@/lib/helpers";
import {
  ChevronRight,
  CreditCard,
  PackageCheck,
  RotateCcw,
  Star,
  Truck,
} from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = product.meta_title || `${product.name} | Poolemark`;
  const description =
    product.meta_description ||
    product.short_description ||
    `${product.name} - Poolemark'ta uygun fiyatla satın alın.`;
  const primaryImage =
    product.images?.find((i) => i.is_primary)?.url ||
    product.images?.[0]?.url ||
    "/og-image.png";

  return {
    title,
    description,
    alternates: {
      canonical: `/products/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://poolemark.com/products/${slug}`,
      type: "website",
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [primaryImage],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const FREE_SHIPPING_THRESHOLD = 500;
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [rating, reviews, relatedProducts, featuredProducts] = await Promise.all([
    getProductRating(product.id).catch(() => ({ average: 0, count: 0 })),
    getProductReviews(product.id).catch(() => []),
    getRelatedProducts(product.category_id, product.id, 4).catch(() => []),
    getFeaturedProducts(8).catch(() => []),
  ]);

  const recommendedProducts =
    relatedProducts.length > 0
      ? relatedProducts
      : featuredProducts
          .filter((p) => p.id !== product.id)
          .slice(0, 4);

  const discount = product.compare_at_price
    ? calculateDiscountPercentage(product.price, product.compare_at_price)
    : 0;
  const productInstallmentMaxQty = Math.min(product.stock_quantity, 10);
  const productInstallmentMinQty = productInstallmentMaxQty >= 3 ? 3 : Math.max(1, productInstallmentMaxQty);

  // Parse m² per pack from product name first, then description as fallback
  // Matches: "1.1 m²", "1,32 m2", "~1.32 m²" etc.
  const sqmRegex = /~?(\d+(?:[.,]\d+)?)\s*m[²2]/i;
  const sqmFromName = product.name.match(sqmRegex);
  const sqmFromDesc = !sqmFromName && product.description
    ? product.description.replace(/<[^>]+>/g, " ").match(sqmRegex)
    : null;
  const sqmRaw = sqmFromName?.[1] ?? sqmFromDesc?.[1] ?? null;
  const sqmPerPack = sqmRaw ? parseFloat(sqmRaw.replace(",", ".")) : null;

  const images =
    product.images?.sort((a, b) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return a.sort_order - b.sort_order;
    }) || [];

  return (
    <>
      <ProductJsonLd
        name={product.name}
        description={product.short_description || product.meta_description || ""}
        image={images?.[0]?.url || ""}
        slug={product.slug}
        price={product.price}
        compareAtPrice={product.compare_at_price}
        inStock={product.stock_quantity > 0}
        rating={rating.average || undefined}
        reviewCount={rating.count || undefined}
        sku={product.sku || undefined}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Anasayfa", href: "/" },
          ...(product.category
            ? [{ name: product.category.name, href: `/kategori/${product.category.slug}` }]
            : []),
          { name: product.name, href: `/products/${product.slug}` },
        ]}
      />
      <section className="pt-4 md:pt-6 pb-24 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center flex-nowrap gap-x-1.5 text-xs sm:text-sm text-muted-foreground mb-6 md:mb-8 min-w-0">
            <Link href="/" className="hover:text-primary transition-colors shrink-0">
              Anasayfa
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            {product.category && (
              <>
                <Link
                  href={`/kategori/${product.category.slug}`}
                  className="hover:text-primary transition-colors shrink-0"
                >
                  {product.category.name}
                </Link>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </>
            )}
            <span className="text-foreground font-medium min-w-0 truncate">
              {product.name}
            </span>
          </nav>

          {/* Product Main */}
          <ProductDetailClient
            product={product}
            images={images}
            disabled={product.stock_quantity <= 0}
          >
            {product.category && (
                <Link
                  href={`/kategori/${product.category.slug}`}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-primary transition-colors"
                >
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mt-1.5 leading-tight">
                {product.name}
              </h1>

              {/* Rating — always visible */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        rating.count > 0 && i < Math.round(rating.average)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                {rating.count > 0 ? (
                  <a
                    href="#degerlendirmeler"
                    className="text-sm text-muted-foreground hover:text-primary underline-offset-2 hover:underline"
                  >
                    {rating.average.toFixed(1)} ({rating.count} değerlendirme)
                  </a>
                ) : (
                  <a
                    href="#degerlendirmeler"
                    className="text-sm text-primary/80 font-medium hover:text-primary underline underline-offset-2"
                  >
                    İlk yorumu sen yap
                  </a>
                )}
              </div>

              {/* Price */}
              <div className="mt-5">
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5">
                  <span className="text-2xl md:text-3xl font-bold text-foreground leading-none">
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_at_price &&
                    product.compare_at_price > product.price && (
                      <>
                        <span className="text-base text-muted-foreground line-through leading-none">
                          {formatPrice(product.compare_at_price)}
                        </span>
                        <span className="px-2 py-1 text-[11px] font-bold bg-destructive text-white rounded-md leading-none">
                          %{discount} İNDİRİM
                        </span>
                      </>
                    )}
                </div>
                <div className="mt-2 flex items-center flex-wrap gap-2">
                  <span className="text-[11px] font-medium text-muted-foreground leading-none">
                    KDV Dahil
                  </span>
                  {product.stock_quantity > (product.low_stock_threshold || 5) && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 leading-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Stokta var
                    </span>
                  )}
                  <span
                    className={`text-[11px] font-semibold leading-none ${
                      product.price >= FREE_SHIPPING_THRESHOLD
                        ? "text-green-700"
                        : "text-amber-700"
                    }`}
                  >
                    {FREE_SHIPPING_THRESHOLD}₺ üzeri ücretsiz kargo
                  </span>
                </div>
                {/* Installment + Calculator hints — side by side */}
                {product.stock_quantity > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <InstallmentModal
                      price={product.price}
                      quantity={productInstallmentMinQty}
                      unitPrice={product.price}
                      minQuantity={productInstallmentMinQty}
                      maxQuantity={Math.max(productInstallmentMinQty, productInstallmentMaxQty)}
                    />
                    {sqmPerPack !== null && (
                      <CoverageCalculator sqmPerPack={sqmPerPack} />
                    )}
                  </div>
                )}
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* Stock Status */}
              <div className="mt-4">
                {product.stock_quantity > 0 ? (
                  product.stock_quantity <=
                  (product.low_stock_threshold || 5) ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-sm font-semibold text-amber-700">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                      ⚡ Son {product.stock_quantity} adet kaldı!
                    </span>
                  ) : null
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    Tükendi
                  </span>
                )}
              </div>



          </ProductDetailClient>

          {/* Tabs: Description, Reviews */}
          <ProductTabs
            description={sanitizeHtml(product.description || "")}
            reviews={reviews}
            productId={product.id}
          />

          {/* Related Products */}
          {recommendedProducts.length > 0 && (
            <div className="mt-12 md:mt-20 pt-8 md:pt-10 border-t border-border/30">
              <p className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                {relatedProducts.length > 0 ? "Benzer Ürünler" : "Önerilen Ürünler"}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 md:mb-8">
                Bunlar da İlginizi Çekebilir
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {recommendedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {/* Recent products (localStorage) */}
          <RecentProducts excludeId={product.id} />
          <RecentProductTracker
            id={product.id}
            slug={product.slug}
            name={product.name}
            image={images?.[0]?.url || null}
            price={product.price}
            compareAtPrice={product.compare_at_price ?? null}
          />
        </div>
      </section>
    </>
  );
}
