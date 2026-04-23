import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDateTime } from "@/lib/helpers";
import { ReturnRequestStatusForm } from "@/components/admin/return-request-status-form";

const STATUS_LABELS: Record<string, string> = {
  requested: "Talep Alındı",
  approved: "Onaylandı",
  in_transit: "Kargoda",
  completed: "Tamamlandı",
  rejected: "Reddedildi",
};

export default async function AdminReturnsPage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("order_return_requests")
    .select("*, order:orders(id, order_number, total), user:users(first_name, last_name, email)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">İade Talepleri</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Son 50 iade talebi listeleniyor
        </p>
      </div>

      <div className="space-y-4">
        {items && items.length > 0 ? (
          items.map((item: any) => (
            <div key={item.id} className="bg-white rounded-2xl border p-4 md:p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Sipariş</p>
                  <Link href={`/admin/siparisler/${item.order?.id}`} className="font-semibold text-primary hover:underline">
                    {item.order?.order_number || "-"}
                  </Link>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Müşteri</p>
                  <p className="text-sm font-medium">
                    {item.user ? `${item.user.first_name || ""} ${item.user.last_name || ""}`.trim() : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Durum</p>
                  <p className="text-sm font-semibold">{STATUS_LABELS[item.status] || item.status}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tarih</p>
                  <p className="text-sm">{formatDateTime(item.created_at)}</p>
                </div>
              </div>

              <div className="rounded-xl bg-secondary/40 p-3 text-sm">
                <p><span className="text-muted-foreground">Neden:</span> {item.reason}</p>
                {item.description && (
                  <p className="mt-1"><span className="text-muted-foreground">Açıklama:</span> {item.description}</p>
                )}
              </div>

              <ReturnRequestStatusForm
                requestId={item.id}
                currentStatus={item.status}
                currentCompany={item.return_shipping_company}
                currentBarcode={item.return_barcode}
                currentAdminNote={item.admin_note}
              />
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border p-10 text-center text-sm text-muted-foreground">
            Henüz iade talebi yok.
          </div>
        )}
      </div>
    </div>
  );
}
