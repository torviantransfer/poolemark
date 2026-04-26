import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice, formatDateTime } from "@/lib/helpers";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "@/constants";
import { ArrowLeft, MapPin, Phone, Mail, Package, FileText } from "lucide-react";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { WhatsAppReminderButton } from "@/components/admin/whatsapp-reminder-button";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, user:users!user_id(first_name, last_name, email, phone), items:order_items(*)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const orderExt = order as any;

  const shippingAddr = order.shipping_address_json;
  const billingAddr = (order as any).billing_address_json as
    | (Record<string, string> & { invoice_type?: string; company_name?: string; tax_office?: string; tax_id?: string })
    | null;
  const isCorporateInvoice = billingAddr?.invoice_type === "corporate";

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/admin/siparisler"
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg md:text-2xl font-bold text-foreground break-all">
              {order.order_number}
            </h1>
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                ORDER_STATUS_COLORS[order.status] || ""
              }`}
            >
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            {formatDateTime(order.created_at)}
          </p>
        </div>
        {order.payment_status === "pending" && (
          <WhatsAppReminderButton
            orderId={order.id}
            orderNumber={order.order_number}
            customerName={
              order.user
                ? `${order.user.first_name} ${order.user.last_name}`.trim()
                : (shippingAddr as any)?.first_name || ""
            }
            phone={(shippingAddr as any)?.phone || order.user?.phone || null}
            items={(order.items || []).map((it: any) => ({
              product_name: it.product_name,
              variant_info: it.variant_info,
              quantity: it.quantity,
            }))}
            total={Number(order.total ?? 0)}
            alreadyRemindedAt={orderExt.reminded_at ?? null}
          />
        )}
        <DeleteOrderButton orderId={order.id} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sol: Sipariş Kalemleri + Müşteri + Adres */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 pb-3">
              <h2 className="text-base font-semibold">Sipariş Kalemleri</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-t text-left text-muted-foreground">
                    <th className="px-3 md:px-5 py-2.5 font-medium">Ürün</th>
                    <th className="px-3 md:px-5 py-2.5 font-medium text-center">Adet</th>
                    <th className="px-3 md:px-5 py-2.5 font-medium text-right">Fiyat</th>
                    <th className="px-3 md:px-5 py-2.5 font-medium text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item: any) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            {item.variant_info && (
                              <p className="text-xs text-muted-foreground">{item.variant_info}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">{item.quantity}</td>
                      <td className="px-5 py-3 text-right">{formatPrice(item.unit_price)}</td>
                      <td className="px-5 py-3 text-right font-medium">
                        {formatPrice(item.unit_price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td colSpan={3} className="px-5 py-2 text-right text-muted-foreground">Ara Toplam</td>
                    <td className="px-5 py-2 text-right font-medium">{formatPrice(order.subtotal)}</td>
                  </tr>
                  {order.shipping_cost > 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-2 text-right text-muted-foreground">Kargo</td>
                      <td className="px-5 py-2 text-right">{formatPrice(order.shipping_cost)}</td>
                    </tr>
                  )}
                  {order.discount_amount > 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-2 text-right text-muted-foreground">İndirim</td>
                      <td className="px-5 py-2 text-right text-green-600">-{formatPrice(order.discount_amount)}</td>
                    </tr>
                  )}
                  <tr className="border-t">
                    <td colSpan={3} className="px-5 py-3 text-right font-semibold">Toplam</td>
                    <td className="px-5 py-3 text-right text-lg font-bold text-primary">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {order.note && (
            <div className="bg-white rounded-2xl border shadow-sm p-5">
              <h2 className="text-base font-semibold mb-2">Sipariş Notu</h2>
              <p className="text-sm text-foreground/80">{order.note}</p>
            </div>
          )}

          {/* Müşteri + Adres yan yana */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Müşteri */}
            <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-3">
              <h2 className="text-base font-semibold">Müşteri</h2>
              {order.user ? (
                <div className="space-y-2 text-sm">
                  <p className="font-medium">
                    {order.user.first_name} {order.user.last_name}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {order.user.email}
                  </p>
                  {order.user.phone && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {order.user.phone}
                    </p>
                  )}
                  <Link
                    href={`/admin/musteriler/${order.user_id}`}
                    className="text-primary text-xs hover:underline"
                  >
                    Müşteri profilini gör →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Misafir sipariş</p>
                  {order.guest_email && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {order.guest_email}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Teslimat Adresi */}
            {shippingAddr && (
              <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-3">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Teslimat Adresi
                </h2>
                <div className="text-sm space-y-1 text-foreground/80">
                  <p className="font-medium">
                    {shippingAddr.first_name} {shippingAddr.last_name}
                  </p>
                  <p>{shippingAddr.address_line}</p>
                  <p>
                    {shippingAddr.neighborhood && `${shippingAddr.neighborhood}, `}
                    {shippingAddr.district} / {shippingAddr.city}
                  </p>
                  {shippingAddr.postal_code && <p>Posta Kodu: {shippingAddr.postal_code}</p>}
                  {shippingAddr.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {shippingAddr.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Kurumsal Fatura */}
          {isCorporateInvoice && billingAddr && (
            <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-3">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Kurumsal Fatura Bilgileri
              </h2>
              <div className="text-sm space-y-1 text-foreground/80">
                <p className="font-medium">{billingAddr.company_name}</p>
                <p>Vergi Dairesi: {billingAddr.tax_office}</p>
                <p>Vergi/TC No: {billingAddr.tax_id}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sağ Sidebar: Ödeme + Durumu Güncelle */}
        <div className="space-y-6">
          {/* Ödeme */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-3">
            <h2 className="text-base font-semibold">Ödeme</h2>
            {order.payment_status === "failed" && (order.payment_failure_reason || order.payment_failure_code) && (
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-rose-300 bg-rose-50">
                <span className="text-xs font-semibold text-rose-700">Ödeme Hatası</span>
                {order.payment_failure_reason && (
                  <span className="text-xs text-rose-700">{order.payment_failure_reason}</span>
                )}
                {order.payment_failure_code && (
                  <span className="text-xs text-rose-500">Kod: {order.payment_failure_code}</span>
                )}
              </div>
            )}
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yöntem</span>
                <span className="font-medium">{order.payment_method || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durum</span>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    PAYMENT_STATUS_COLORS[order.payment_status] || ""
                  }`}
                >
                  {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Fatura No</span>
                <span className="font-medium text-right break-all">{orderExt.invoice_number || "—"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Fatura</span>
                {orderExt.invoice_url ? (
                  <a
                    href={orderExt.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Görüntüle
                  </a>
                ) : (
                  <span className="font-medium">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Durumu Güncelle */}
          <OrderStatusForm
            orderId={order.id}
            currentStatus={order.status}
            currentPaymentStatus={order.payment_status}
            cargoCompany={order.cargo_company || ""}
            cargoTrackingNumber={order.cargo_tracking_number || ""}
            invoiceNumber={orderExt.invoice_number || ""}
            invoiceUrl={orderExt.invoice_url || ""}
            orderTotal={order.total}
          />
        </div>
      </div>
    </div>
  );
}
