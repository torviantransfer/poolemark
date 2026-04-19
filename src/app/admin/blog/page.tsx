import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/helpers";
import { FileText, Plus, Edit, Eye } from "lucide-react";
import { AdminDeleteButton } from "@/components/admin/delete-button";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, is_published, created_at, cover_image_url, author:users!author_id(first_name, last_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {posts?.length || 0} yazı
          </p>
        </div>
        <Link
          href="/admin/blog/ekle"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Yeni Yazı
        </Link>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground bg-secondary/30">
                <th className="px-5 py-3 font-medium">Başlık</th>
                <th className="px-5 py-3 font-medium">Yazar</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium">Tarih</th>
                <th className="px-5 py-3 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {post.cover_image_url && (
                          <img src={post.cover_image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <span className="font-medium truncate max-w-[250px]">{post.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-foreground/70">{(post.author as any)?.first_name ? `${(post.author as any).first_name} ${(post.author as any).last_name}` : "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        post.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {post.is_published ? "Yayında" : "Taslak"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(post.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link href={`/admin/blog/${post.id}`} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <AdminDeleteButton id={post.id} table="blog_posts" label={post.title} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    Henüz blog yazısı yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
