import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPrice } from "@/lib/helpers";
import { Truck, Plus, Edit } from "lucide-react";
import { AdminDeleteButton } from "@/components/admin/delete-button";
import { AdminToggleActiveButton } from "@/components/admin/toggle-active-button";

export default async function AdminShippingCompaniesPage() {
  const supabase = await createClient();
  const { data: companies } = await supabase
    .from("shipping_companies")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kargo Firmaları</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kargo firmalarını, ücretleri ve teslimat sürelerini yönetin
          </p>
        </div>
        <Link
          href="/admin/kargolar/ekle"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Yeni Firma
        </Link>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground bg-secondary/30">
                <th className="px-5 py-3 font-medium">Firma</th>
                <th className="px-5 py-3 font-medium">Kod</th>
                <th className="px-5 py-3 font-medium">Ücret</th>
                <th className="px-5 py-3 font-medium">Ücretsiz Kargo</th>
                <th className="px-5 py-3 font-medium">Teslimat</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {companies && companies.length > 0 ? (
                companies.map((company) => (
                  <tr key={company.id} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                          <div className="w-20 h-7 flex items-center shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={company.logo_url || `/shipping/${company.code}.png`}
                              alt={company.name}
                              className="max-h-7 max-w-[80px] w-auto object-contain"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          </div>
                          <span className="font-medium text-sm">{company.name}</span>
                        </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{company.code}</td>
                    <td className="px-5 py-3">{formatPrice(company.price || 0)}</td>
                    <td className="px-5 py-3 text-foreground/70">
                      {company.free_shipping_threshold ? formatPrice(company.free_shipping_threshold) : "Yok"}
                    </td>
                    <td className="px-5 py-3 text-foreground/70">{company.estimated_days || "-"}</td>
                    <td className="px-5 py-3">
                      <AdminToggleActiveButton
                        id={company.id}
                        table="shipping_companies"
                        isActive={company.is_active}
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/kargolar/${company.id}`}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <AdminDeleteButton
                          id={company.id}
                          table="shipping_companies"
                          label={company.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-muted-foreground">
                    <Truck className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    Henüz kargo firması eklenmemiş
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
