import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/helpers";
import { File, Edit } from "lucide-react";
import { AdminDeleteButton } from "@/components/admin/delete-button";

export default async function AdminPagesPage() {
  const supabase = await createClient();
  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sayfalar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Statik sayfaları yönetin
        </p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground bg-secondary/30">
                <th className="px-5 py-3 font-medium">Başlık</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium">Tarih</th>
                <th className="px-5 py-3 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {pages && pages.length > 0 ? (
                pages.map((page) => (
                  <tr key={page.id} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3 font-medium">{page.title}</td>
                    <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{page.slug}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${page.is_active ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {page.is_active ? "Yayında" : "Taslak"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(page.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/sayfalar/${page.id}`} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <AdminDeleteButton id={page.id} table="pages" label={page.title} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">
                    <File className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    Henüz sayfa eklenmemiş
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
