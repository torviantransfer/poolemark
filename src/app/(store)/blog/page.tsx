import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/services/blog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/helpers";
import { ChevronRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Duvar Paneli ve Folyo Uygulama Rehberleri | Poolemark Blog",
  description:
    "PVC duvar paneli nasıl uygulanır? Yapışkanlı folyo iz bırakır mı? Metrekare hesaplama, ürün karşılaştırma ve adım adım uygulama rehberleri.",
  alternates: {
    canonical: "https://poolemark.com/blog",
  },
};

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = parseInt(sp.sayfa || "1", 10);
  const { posts, total } = await getBlogPosts(page, 9);
  const totalPages = Math.ceil(total / 9);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 via-primary/3 to-white border-b border-border/30">
        <div className="container mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <nav className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-5">
              <Link href="/" className="hover:text-primary transition-colors">
                Anasayfa
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">Blog</span>
            </nav>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6">
              <BookOpen className="h-4 w-4" />
              <span>Uygulama rehberleri ve ilham</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              Fikirler, Rehberler ve{" "}
              <span className="text-primary">İlham</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              PVC panellerden yapışkanlı folyoya, adım adım uygulama rehberleri,
              ipuçları ve dekorasyon fikirleri.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group rounded-2xl overflow-hidden border border-border/40 bg-white hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative aspect-[16/9] bg-secondary overflow-hidden">
                      {post.cover_image_url ? (
                        <Image
                          src={post.cover_image_url}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground/20 text-4xl">
                          📝
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      {post.published_at && (
                        <time className="text-xs text-muted-foreground">
                          {formatDate(post.published_at)}
                        </time>
                      )}
                      <h2 className="text-base font-semibold text-foreground mt-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-4">
                        Devamını Oku
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                  {page > 1 && (
                    <Button
                      render={<Link href={`/blog?sayfa=${page - 1}`} />}
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
                          render={<Link href={`/blog?sayfa=${p}`} />}
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
                      render={<Link href={`/blog?sayfa=${page + 1}`} />}
                      variant="outline"
                      size="sm"
                    >
                      Sonraki
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg font-semibold text-foreground">
                Henüz blog yazısı yok
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Yakında ilham verici içerikler burada olacak.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
