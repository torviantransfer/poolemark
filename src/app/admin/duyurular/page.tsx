import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/helpers";
import { Megaphone } from "lucide-react";
import { AdminDeleteButton } from "@/components/admin/delete-button";

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Duyurular</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Üst bar duyuru mesajları
        </p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground bg-secondary/30">
                <th className="px-5 py-3 font-medium">Mesaj</th>
                <th className="px-5 py-3 font-medium">Link</th>
                <th className="px-5 py-3 font-medium">Renk</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {announcements && announcements.length > 0 ? (
                announcements.map((a) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3 max-w-[300px] truncate">{a.message}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{a.link_url || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: a.bg_color || "#E8712B" }} />
                        <span className="text-xs font-mono">{a.bg_color || "#E8712B"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${a.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {a.is_active ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <AdminDeleteButton id={a.id} table="announcements" label={a.message} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">
                    <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    Henüz duyuru eklenmemiş
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
