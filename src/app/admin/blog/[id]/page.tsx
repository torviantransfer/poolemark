import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BlogPostForm } from "@/components/admin/blog-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminBlogEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (!post) notFound();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/blog" className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Yazı Düzenle</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{post.title}</p>
        </div>
      </div>
      <BlogPostForm post={post} />
    </div>
  );
}
