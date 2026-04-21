import Link from "next/link";
import { getProducts } from "@/services/products";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Search, SearchX } from "lucide-react";
import type { Metadata } from "next";
import { SearchForm } from "@/components/store/search-form";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: sp.q ? `"${sp.q}" araması | Poolemark` : "Arama | Poolemark",
    robots: { index: false, follow: false },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const query = sp.q || "";
  const sort = sp.sort || "newest";
  const page = parseInt(sp.sayfa || "1", 10);

  const { products, total, totalPages } = query
    ? await getProducts({ search: query, sort, page, limit: 12 })
    : { products: [], total: 0, totalPages: 0 };

  return (
    <>
      <section className="bg-secondary/40 border-b">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <Link href="/" className="hover:text-primary transition-colors">
              Anasayfa
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Arama</span>
          </nav>
          {query ? (
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              &ldquo;{query}&rdquo; için sonuçlar
            </h1>
          ) : (
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Arama
            </h1>
          )}
          {query && (
            <p className="text-sm text-muted-foreground mt-1">
              {total} ürün bulundu
            </p>
          )}
          <div className="mt-4">
            <SearchForm defaultValue={query} />
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && (
                    <Button
                      render={
                        <Link
                          href={`/arama?q=${encodeURIComponent(query)}&sort=${sort}&sayfa=${page - 1}`}
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
                        p === 1 || p === totalPages || Math.abs(p - page) <= 1
                    )
                    .map((p, idx, arr) => (
                      <span key={p} className="contents">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-1 text-muted-foreground">…</span>
                        )}
                        <Button
                          render={
                            <Link
                              href={`/arama?q=${encodeURIComponent(query)}&sort=${sort}&sayfa=${p}`}
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
                          href={`/arama?q=${encodeURIComponent(query)}&sort=${sort}&sayfa=${page + 1}`}
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
            </>
          ) : query ? (
            <div className="text-center py-20">
              <SearchX className="h-14 w-14 text-muted-foreground/25 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                Sonuç bulunamadı
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                &ldquo;{query}&rdquo; ile eşleşen ürün bulunamadı. Farklı
                anahtar kelimeler deneyebilirsiniz.
              </p>
              <Button
                render={<Link href="/products" />}
                variant="outline"
                className="mt-6"
              >
                Tüm Ürünlere Göz At
              </Button>
            </div>
          ) : (
            <div className="text-center py-20">
              <Search className="h-14 w-14 text-muted-foreground/25 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                Ürün Arayın
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Yukarıdaki arama kutusunu kullanarak ürün arayabilirsiniz.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
