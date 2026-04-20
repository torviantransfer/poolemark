import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/helpers";
import { Ticket, Plus, Edit } from "lucide-react";
import { AdminDeleteButton } from "@/components/admin/delete-button";

export default async function AdminCouponsPage() {
  const supabase = await createClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kuponlar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            İndirim kuponlarını yönetin
          </p>
        </div>
        <Link
          href="/admin/kuponlar/ekle"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Yeni Kupon
        </Link>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground bg-secondary/30">
                <th className="px-5 py-3 font-medium">Kod</th>
                <th className="px-5 py-3 font-medium">İndirim</th>
                <th className="px-5 py-3 font-medium">Min. Tutar</th>
                <th className="px-5 py-3 font-medium">Kullanım</th>
                <th className="px-5 py-3 font-medium">Geçerlilik</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {coupons && coupons.length > 0 ? (
                coupons.map((coupon) => {
                  const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
                  return (
                    <tr key={coupon.id} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-primary">{coupon.code}</td>
                      <td className="px-5 py-3">
                        {coupon.type === "percentage"
                          ? `%${coupon.value}`
                          : coupon.type === "free_shipping"
                            ? "Ücretsiz Kargo"
                            : formatPrice(coupon.value)}
                      </td>
                      <td className="px-5 py-3 text-foreground/70">
                        {coupon.min_order_amount ? formatPrice(coupon.min_order_amount) : "—"}
                      </td>
                      <td className="px-5 py-3 text-foreground/70">
                        {coupon.used_count} / {coupon.max_uses || "∞"}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {coupon.starts_at && formatDate(coupon.starts_at)}
                        {coupon.expires_at && ` — ${formatDate(coupon.expires_at)}`}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          isExpired ? "bg-gray-100 text-gray-600" : coupon.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {isExpired ? "Süresi Dolmuş" : coupon.is_active ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right flex items-center justify-end gap-1">
                        <Link href={`/admin/kuponlar/${coupon.id}`} className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <AdminDeleteButton id={coupon.id} table="coupons" label={coupon.code} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-muted-foreground">
                    <Ticket className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    Henüz kupon eklenmemiş
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
