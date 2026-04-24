import Link from "next/link";
import { Home, Search, ArrowLeft, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/services/products";
import { getCategories } from "@/services/categories";
import { ProductCard } from "@/components/store/product-card";
import { NotFoundTracker } from "@/components/store/not-found-tracker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı (404)",
  description: "Aradığınız sayfa bulunamadı. Ürünlerimize göz atabilirsiniz.",
};

export default async function NotFound() {
  const categories = await getCategories().catch(() => []);
  const { products } = await getProducts({ limit: 4, sort: "newest" }).catch(
    () => ({ products: [], total: 0, totalPages: 0 })
  );

  const popularCategories = categories.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <NotFoundTracker />
      {/* Hero Bölümü */}
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-50">
          <PackageX className="h-12 w-12 text-[#E8712B]" />
        </div>

        <h1 className="mb-3 text-6xl font-bold text-[#E8712B]">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-[#2D2D2D]">
          Sayfa Bulunamadı
        </h2>
        <p className="mb-8 max-w-md text-[#737373]">
          Aradığınız sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
          Ana sayfaya dönebilir veya ürünlerimize göz atabilirsiniz.
        </p>

        <form action="/arama" method="get" className="w-full max-w-md mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              name="q"
              placeholder="Ürün ara..."
              className="flex-1 h-11 rounded-lg border border-border bg-white px-3 text-sm"
            />
            <Button type="submit" className="h-11 px-4">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {popularCategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-2xl">
            {popularCategories.map((c) => (
              <Link
                key={c.id}
                href={`/kategori/${c.slug}`}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-white hover:bg-secondary transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <Button render={<Link href="/" />} size="lg">
            <Home className="mr-2 h-4 w-4" />
            Ana Sayfaya Dön
          </Button>
          <Button
            render={<Link href="/products" />}
            variant="outline"
            size="lg"
          >
            <Search className="mr-2 h-4 w-4" />
            Ürünleri Keşfet
          </Button>
        </div>
      </div>

      {/* Popüler Ürünler */}
      {products.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[#2D2D2D]">
              Öne Çıkan Ürünler
            </h3>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm text-[#E8712B] hover:text-[#C45D1F]"
            >
              Tümünü gör
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
