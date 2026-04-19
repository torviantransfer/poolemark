import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/helpers";
import { Image } from "lucide-react";
import { AdminDeleteButton } from "@/components/admin/delete-button";

export default async function AdminBannersPage() {
  const supabase = await createClient();
  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order");

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bannerlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ana sayfa slider görselleri
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners && banners.length > 0 ? (
          banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden group">
              <div className="aspect-[16/7] bg-secondary relative">
                {banner.image_url ? (
                  <img src={banner.image_url} alt={banner.title || ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${banner.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {banner.is_active ? "Aktif" : "Pasif"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-sm truncate">{banner.title || "Başlıksız"}</h3>
                {banner.subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{banner.subtitle}</p>}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">Sıra: {banner.sort_order}</span>
                  <AdminDeleteButton id={banner.id} table="banners" label={banner.title || "Banner"} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-2xl border shadow-sm p-16 text-center text-muted-foreground">
            <Image className="h-10 w-10 mx-auto mb-3 opacity-30" />
            Henüz banner eklenmemiş
          </div>
        )}
      </div>
    </div>
  );
}
