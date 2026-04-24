import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import sanitizeHtml from "sanitize-html";
import { getBlogPostBySlug } from "@/services/blog";
import { formatDate } from "@/lib/helpers";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/components/shared/json-ld";
import type { Metadata } from "next";

const BASE_URL = "https://poolemark.com";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600; // 1 hour

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || "";
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/blog/${slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${BASE_URL}/blog/${slug}`,
      siteName: "Poolemark",
      locale: "tr_TR",
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="py-8 md:py-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Anasayfa", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: post.title, href: `/blog/${slug}` },
        ]}
      />
      {post.published_at && (
        <BlogPostJsonLd
          title={post.title}
          description={post.meta_description || post.excerpt || ""}
          slug={slug}
          image={post.cover_image_url || undefined}
          publishedAt={post.published_at}
          updatedAt={post.updated_at || undefined}
          authorName={post.author ? `${post.author.first_name} ${post.author.last_name}` : "Poolemark"}
        />
      )}
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Anasayfa
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/blog" className="hover:text-primary transition-colors">
            Blog
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {post.title}
          </span>
        </nav>

        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            {post.published_at && (
              <time dateTime={post.published_at} className="text-sm text-muted-foreground">
                {formatDate(post.published_at)}
              </time>
            )}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-2 leading-tight">
              {post.title}
            </h1>
            {post.author && (
              <p className="text-sm text-muted-foreground mt-3">
                {post.author.first_name} {post.author.last_name}
              </p>
            )}
          </header>

          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-sm sm:prose-base lg:prose-lg prose-green max-w-none text-foreground/90 prose-a:text-primary prose-a:no-underline hover:prose-a:underline break-words"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content, {
              allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "iframe", "figure", "figcaption"]),
              allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                img: ["src", "alt", "width", "height", "loading", "class"],
                iframe: ["src", "width", "height", "frameborder", "allowfullscreen", "class"],
                "*": ["class", "id"],
              },
              allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
            }) }}
          />

          {/* Back to Blog */}
          <div className="mt-12 pt-8 border-t border-border/50 flex items-center justify-between">
            <Button
              render={<Link href="/blog" />}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Tüm Yazılar
            </Button>
            <Button
              render={<Link href="/products" />}
              className="gap-2"
            >
              Ürünleri Keşfet
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
