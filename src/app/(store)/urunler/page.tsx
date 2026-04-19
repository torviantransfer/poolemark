import Link from "next/link";
import { getProducts } from "@/services/products";
import { getCategories } from "@/services/categories";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tüm Ürünler | Poolemark",
  description:
    "PVC panel, duvar kaplama, dekorasyon ürünleri ve ev gereçleri. Uygun fiyat ve hızlı kargo ile Poolemark'ta.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const sort = sp.sort || "newest";
  const page = parseInt(sp.sayfa || "1", 10);
  const categorySlug = sp.kategori;

  const [{ products, total, totalPages }, categories] = await Promise.all([
    getProducts({ sort, page, limit: 12 }),
    getCategories().catch(() => []),
  ]);

  return (
    <>
      {/* Header */}
      <section className="bg-secondary/40 border-b">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <Link href="/" className="hover:text-primary transition-colors">
              Anasayfa
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Ürünler</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Tüm Ürünler
          </h1>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-60 shrink-0">
              <div className="sticky top-24 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Kategoriler
                  </h3>
                  <ul className="space-y-1.5">
                    <li>
                      <Link
                        href="/products"
                        className={`text-sm transition-colors ${
                          !categorySlug
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Tümü
                      </Link>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <Link
                          href={`/kategori/${cat.slug}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Sıralama
                  </h3>
                  <ul className="space-y-1.5">
                    {[
                      { value: "newest", label: "En Yeni" },
                      { value: "price_asc", label: "Fiyat: Düşükten Yükseğe" },
                      { value: "price_desc", label: "Fiyat: Yüksekten Düşüğe" },
                      { value: "name_asc", label: "A-Z" },
                    ].map((opt) => (
                      <li key={opt.value}>
                        <Link
                          href={`/products?sort=${opt.value}`}
                          className={`text-sm transition-colors ${
                            sort === opt.value
                              ? "text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {opt.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile toolbar */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{total}</span>{" "}
                  ürün bulundu
                </p>
                {/* Mobile sort dropdown could go here */}
              </div>

              {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <SlidersHorizontal className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Ürün bulunamadı
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Henüz ürün eklenmemiş.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && (
                    <Button
                      render={
                        <Link href={`/products?sort=${sort}&sayfa=${page - 1}`} />
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
                        p === 1 || p === totalPages || Math.abs(p - page) <= 1
                    )
                    .map((p, idx, arr) => (
                      <span key={p} className="contents">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-1 text-muted-foreground">…</span>
                        )}
                        <Button
                          render={
                            <Link href={`/products?sort=${sort}&sayfa=${p}`} />
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
                        <Link href={`/products?sort=${sort}&sayfa=${page + 1}`} />
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
          </div>
        </div>
      </section>
    </>
  );
}
