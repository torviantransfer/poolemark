import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDate } from "@/lib/helpers";
import { Ticket, Plus } from "lucide-react";
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
                  const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date();
                  return (
                    <tr key={coupon.id} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-primary">{coupon.code}</td>
                      <td className="px-5 py-3">
                        {coupon.discount_type === "percentage"
                          ? `%${coupon.discount_value}`
                          : formatPrice(coupon.discount_value)}
                      </td>
                      <td className="px-5 py-3 text-foreground/70">
                        {coupon.min_order_amount ? formatPrice(coupon.min_order_amount) : "—"}
                      </td>
                      <td className="px-5 py-3 text-foreground/70">
                        {coupon.used_count} / {coupon.usage_limit || "∞"}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {coupon.valid_from && formatDate(coupon.valid_from)}
                        {coupon.valid_until && ` — ${formatDate(coupon.valid_until)}`}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          isExpired ? "bg-gray-100 text-gray-600" : coupon.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {isExpired ? "Süresi Dolmuş" : coupon.is_active ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
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
