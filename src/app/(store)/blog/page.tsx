import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/services/blog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/helpers";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Poolemark",
  description: "Ev dekorasyonu ipuçları, ürün incelemeleri ve daha fazlası.",
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
      <section className="bg-secondary/40 border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <Link href="/" className="hover:text-primary transition-colors">
              Anasayfa
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Blog</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Blog
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            İpuçları, fikirler ve ilham
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {posts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground/20 text-4xl">
                          📝
                        </div>
                      )}
                    </div>
                    <div className="p-5">
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
                      <span className="inline-block text-sm font-medium text-primary mt-3">
                        Devamını Oku →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && (
                    <Button
                      render={<Link href={`/blog?sayfa=${page - 1}`} />}
                      variant="outline"
                      size="sm"
                    >
                      Önceki
                    </Button>
                  )}
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
