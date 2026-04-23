import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCategoryBySlug } from "@/services/categories";
import { getProducts } from "@/services/products";
import { ProductCard } from "@/components/store/product-card";
import { ProductSort } from "@/components/store/product-sort";
import { Button } from "@/components/ui/button";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.meta_title || `${category.name} | Poolemark`,
    description:
      category.meta_description ||
      `${category.name} kategorisindeki ürünleri keşfedin. Uygun fiyat ve hızlı kargo ile Poolemark'ta.`,
    alternates: { canonical: `https://poolemark.com/kategori/${slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const sort = sp.sort || "newest";
  const page = parseInt(sp.sayfa || "1", 10);

  const { products, total, totalPages } = await getProducts({
    categoryId: category.id,
    sort,
    page,
    limit: 12,
  });

  return (
    <>
      {/* Category Header */}
      <section className="bg-secondary/40 border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">
              Anasayfa
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            {category.image_url && (
              <div className="hidden md:block relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          {/* Subcategories */}
          {category.children && category.children.length > 0 && (
            <div id="subcategories" className="flex flex-wrap gap-2 mt-5">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/kategori/${child.slug}`}
                  className="px-4 py-1.5 text-sm font-medium bg-white border border-border/60 rounded-full hover:bg-accent hover:border-primary/30 hover:text-primary transition-all"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Products */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Toolbar */}
          <div className="sticky top-[68px] z-30 mb-6 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-b border-border/60">
            <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{total}</span> ürün
              bulundu
            </p>
              <div className="flex items-center gap-2">
                {category.children && category.children.length > 0 && (
                  <Button
                    render={<Link href="#subcategories" />}
                    variant="outline"
                    size="sm"
                    className="md:hidden"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-1" />
                    Filtrele
                  </Button>
                )}
                <ProductSort currentSort={sort} />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 4} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <SlidersHorizontal className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                Ürün bulunamadı
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Bu kategoride henüz ürün bulunmuyor.
              </p>
              <Button render={<Link href="/products" />} variant="outline" className="mt-6">
                Tüm Ürünlere Göz At
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {page > 1 && (
                <Button
                  render={
                    <Link
                      href={`/kategori/${slug}?sort=${sort}&sayfa=${page - 1}`}
                    />
                  }
                  variant="outline"
                  size="sm"
                >
                  Önceki
                </Button>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - page) <= 1
                )
                .map((p, idx, arr) => (
                  <span key={p} className="contents">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-muted-foreground">…</span>
                    )}
                    <Button
                      render={
                        <Link
                          href={`/kategori/${slug}?sort=${sort}&sayfa=${p}`}
                        />
                      }
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      className="w-9"
                    >
                      {p}
                    </Button>
                  </span>
                ))}
              {page < totalPages && (
                <Button
                  render={
                    <Link
                      href={`/kategori/${slug}?sort=${sort}&sayfa=${page + 1}`}
                    />
                  }
                  variant="outline"
                  size="sm"
                >
                  Sonraki
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
