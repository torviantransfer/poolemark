import { notFound } from "next/navigation";
import { getProducts, getFeaturedProducts, getNewProducts } from "@/services/products";
import { ProductCard } from "@/components/store/product-card";
import { PageNav } from "@/components/ui/pagination";
import type { Metadata } from "next";

interface CollectionProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const collections: Record<
  string,
  {
    title: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
  }
> = {
  all: {
    title: "Tüm Ürünler",
    description: "Poolemark'ın tüm ürünlerini keşfedin",
    metaTitle: "Tüm Ürünler | Poolemark",
    metaDescription: "Poolemark'ın kapsamlı ürün koleksiyonu. Ev dekorasyonu, mutfak gereçleri ve daha fazlası.",
  },
  "yeni-urunler": {
    title: "Yeni Ürünler",
    description: "En son eklenen ürünlerimizi keşfedin",
    metaTitle: "Yeni Ürünler | Poolemark",
    metaDescription: "Poolemark'a yeni eklenen ürünleri görün. Trendiest çıkan ürünlerimiz.",
  },
  featured: {
    title: "Öne Çıkan Ürünler",
    description: "Özel olarak seçilmiş en iyi ürünlerimiz",
    metaTitle: "Öne Çıkan Ürünler | Poolemark",
    metaDescription: "Poolemark'ın özel seçkisi. En popüler ve kaliteli ürünlerimiz.",
  },
};

export async function generateMetadata({ params }: CollectionProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = collections[slug];

  if (!collection) {
    return {
      title: "Koleksiyon Bulunamadı",
    };
  }

  return {
    title: collection.metaTitle,
    description: collection.metaDescription,
    openGraph: {
      title: collection.metaTitle,
      description: collection.metaDescription,
      type: "website",
    },
  };
}

export default async function CollectionPage({ params, searchParams }: CollectionProps) {
  const { slug } = await params;
  const { page = "1" } = await searchParams;
  const currentPage = parseInt(page);

  const collection = collections[slug];

  if (!collection) {
    notFound();
  }

  let result;

  if (slug === "all") {
    result = await getProducts({ page: currentPage, limit: 12 });
  } else if (slug === "yeni-urunler") {
    result = await getProducts({ page: currentPage, limit: 12 });
  } else if (slug === "featured") {
    result = await getProducts({ featured: true, page: currentPage, limit: 12 });
  } else {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-border/30">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">{collection.title}</h1>
          <p className="text-lg text-muted-foreground">{collection.description}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {result.total} ürün bulundu
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {result.products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {result.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {result.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <PageNav
                  currentPage={currentPage}
                  totalPages={result.totalPages}
                  basePath={`/collections/${slug}`}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Bu koleksiyonda ürün bulunamadı.</p>
          </div>
        )}
      </div>
    </main>
  );
}
