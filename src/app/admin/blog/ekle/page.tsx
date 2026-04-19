import { BlogPostForm } from "@/components/admin/blog-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminBlogAddPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/blog" className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Yeni Blog Yazısı</h1>
        </div>
      </div>
      <BlogPostForm />
    </div>
  );
}
