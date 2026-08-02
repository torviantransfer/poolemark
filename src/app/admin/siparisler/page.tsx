import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPrice, formatDateTime } from "@/lib/helpers";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  COD_CONFIRMATION_LABELS,
  COD_CONFIRMATION_COLORS,
} from "@/constants";
import { ShoppingCart, Eye } from "lucide-react";
import { AdminSearchForm } from "@/components/admin/search-form";
import { WhatsAppReminderButton } from "@/components/admin/whatsapp-reminder-button";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const status = params.status || "all";
  const limit = 20;
  const from = (page - 1) * limit;

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      "*, user:users!user_id(first_name, last_name, email), return_requests:order_return_requests(status, created_at), items:order_items(product_name, variant_info, quantity)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (search) query = query.ilike("order_number", `%${search}%`);

  // "abandoned" = ödeme yarıda bırakılmış (PayTR'a gidildi ama kart girilmedi / iframe kapatıldı).
  // Kapıda ödeme siparişleri de payment_status='pending' taşır; bunları "yarım bırakılan"
  // olarak SAYMA — ayrı bir akış. Diğer sekmelerde ise kapıda ödeme siparişleri görünmeli.
  if (status === "abandoned") {
    query = query
      .eq("payment_status", "pending")
      .neq("payment_method", "cash_on_delivery");
  } else if (status === "cod_pending") {
    query = query
      .eq("payment_method", "cash_on_delivery")
      .eq("cod_confirmation_status", "pending");
  } else {
    // Yarım bırakılmış (pending & kapıda değil) kayıtları gizle; kapıda ödemeleri göster.
    query = query.or(
      "payment_status.neq.pending,payment_method.eq.cash_on_delivery"
    );
    if (status !== "all") query = query.eq("status", status);
  }

  const { data: orders, count } = await query;
  const totalPages = Math.ceil((count || 0) / limit);

  // Yarım kalan ödeme sayısı (admin'in dikkatini çekmek için sekmede göstereceğiz).
  const { count: abandonedCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("payment_status", "pending")
    .neq("payment_method", "cash_on_delivery");

  // Kapıda ödeme onayı bekleyen siparişler.
  const { count: codPendingCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("payment_method", "cash_on_delivery")
    .eq("cod_confirmation_status", "pending");

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="rounded-2xl border bg-white/90 backdrop-blur shadow-sm px-5 py-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Siparişler</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {count || 0} sipariş bulundu
          {status !== "abandoned" && (abandonedCount || 0) > 0 && (
            <>
              {" "}·{" "}
              <Link
                href="/admin/siparisler?status=abandoned"
                className="text-amber-600 hover:underline underline-offset-4"
              >
                {abandonedCount} yarım bırakılmış ödeme
              </Link>
            </>
          )}
          {status !== "cod_pending" && (codPendingCount || 0) > 0 && (
            <>
              {" "}·{" "}
              <Link
                href="/admin/siparisler?status=cod_pending"
                className="text-emerald-600 hover:underline underline-offset-4"
              >
                {codPendingCount} kapıda ödeme onay bekliyor
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur rounded-2xl border shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <AdminSearchForm placeholder="Sipariş no ara..." defaultValue={search} />
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "all", label: "Tümü" },
              { value: "confirmed", label: "Onaylı" },
              { value: "preparing", label: "Hazırlanıyor" },
              { value: "shipped", label: "Kargoda" },
              { value: "delivered", label: "Teslim" },
              { value: "cancelled", label: "İptal" },
              {
                value: "cod_pending",
                label: `Kapıda Onay Bekliyor${(codPendingCount || 0) > 0 ? ` (${codPendingCount})` : ""}`,
              },
              {
                value: "abandoned",
                label: `Yarım Bırakılan${(abandonedCount || 0) > 0 ? ` (${abandonedCount})` : ""}`,
              },
            ].map((s) => (
              <Link
                key={s.value}
                href={`/admin/siparisler?status=${s.value}${search ? `&search=${search}` : ""}`}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  status === s.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/80 text-foreground/70 hover:bg-secondary"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b text-left text-muted-foreground bg-secondary/40">
                <th className="px-3 md:px-5 py-3 font-medium">Sipariş No</th>
                <th className="px-3 md:px-5 py-3 font-medium">Müşteri</th>
                <th className="px-3 md:px-5 py-3 font-medium">Tutar</th>
                <th className="px-3 md:px-5 py-3 font-medium">Ödeme</th>
                <th className="px-3 md:px-5 py-3 font-medium">Durum</th>
                <th className="px-3 md:px-5 py-3 font-medium">Tarih</th>
                <th className="px-3 md:px-5 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                orders.map((order) => {
                  const latestReturn = Array.isArray((order as any).return_requests)
                    ? [...(order as any).return_requests].sort(
                        (a: any, b: any) =>
                          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                      )[0]
                    : null;
                  const hasActiveReturn =
                    latestReturn?.status && latestReturn.status !== "rejected";
                  const displayStatusLabel = hasActiveReturn
                    ? latestReturn.status === "completed"
                      ? "İade Tamamlandı"
                      : "İade Sürecinde"
                    : ORDER_STATUS_LABELS[order.status] || order.status;
                  const displayStatusColor = hasActiveReturn
                    ? latestReturn.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                    : ORDER_STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800";

                  return (
                  <tr
                    key={order.id}
                    className="border-b last:border-0 hover:bg-primary/[0.04] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/siparisler/${order.id}`}
                        className="text-primary font-medium hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-foreground/80">
                      {order.user
                        ? `${order.user.first_name} ${order.user.last_name}`
                        : order.guest_email || "Misafir"}
                    </td>
                    <td className="px-5 py-3 font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          PAYMENT_STATUS_COLORS[order.payment_status] || ""
                        }`}
                      >
                        {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                      </span>
                      {order.payment_method === "cash_on_delivery" && (
                        <span
                          className={`mt-1 flex w-fit px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            COD_CONFIRMATION_COLORS[order.cod_confirmation_status || "pending"] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          Kapıda · {COD_CONFIRMATION_LABELS[order.cod_confirmation_status || "pending"] || "Onay Bekliyor"}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${displayStatusColor}`}
                      >
                        {displayStatusLabel}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {status === "abandoned" && (
                          <WhatsAppReminderButton
                            orderId={order.id}
                            orderNumber={order.order_number}
                            customerName={
                              order.user
                                ? `${order.user.first_name} ${order.user.last_name}`.trim()
                                : (order.shipping_address_json as any)?.first_name || ""
                            }
                            phone={
                              (order.shipping_address_json as any)?.phone ||
                              order.user?.phone ||
                              null
                            }
                            items={(order as any).items || []}
                            total={Number(order.total ?? 0)}
                            alreadyRemindedAt={(order as any).reminded_at ?? null}
                            variant="icon"
                          />
                        )}
                        <Link
                          href={`/admin/siparisler/${order.id}`}
                          className="p-2 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors inline-flex"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <DeleteOrderButton orderId={order.id} variant="icon" />
                      </div>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-muted-foreground">
                    <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    {search ? "Aramanızla eşleşen sipariş bulunamadı" : "Henüz sipariş yok"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t bg-secondary/20">
            <p className="text-sm text-muted-foreground">
              Sayfa {page} / {totalPages}
            </p>
            <div className="flex gap-1">
              {page > 1 && (
                <Link
                  href={`/admin/siparisler?page=${page - 1}${search ? `&search=${search}` : ""}${status !== "all" ? `&status=${status}` : ""}`}
                  className="px-3 py-1.5 rounded-lg text-sm bg-white border hover:bg-secondary/70 transition-colors"
                >
                  Önceki
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/siparisler?page=${page + 1}${search ? `&search=${search}` : ""}${status !== "all" ? `&status=${status}` : ""}`}
                  className="px-3 py-1.5 rounded-lg text-sm bg-white border hover:bg-secondary/70 transition-colors"
                >
                  Sonraki
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
