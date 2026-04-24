import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Package,
  MapPin,
  CreditCard,
  Truck,
  FileText,
  RotateCcw,
} from "lucide-react";
import { formatPrice, formatDateTime } from "@/lib/helpers";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "@/constants";
import { ReturnRequestForm } from "@/components/store/return-request-form";

function mapPaymentMethod(method?: string | null) {
  if (!method) return "Kredi Kartı";
  const normalized = method.toLowerCase();
  if (normalized === "credit_card") return "Kredi Kartı (PayTR)";
  if (normalized === "bank_transfer") return "Havale / EFT";
  if (normalized === "cash_on_delivery") return "Kapıda Ödeme";
  return method;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lookupValue = decodeURIComponent(id);
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/giris");

  let order: any = null;

  const { data: byOrderNumber } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", lookupValue.toUpperCase())
    .eq("user_id", user.id)
    .maybeSingle();

  if (byOrderNumber) {
    order = byOrderNumber;
  } else if (uuidRegex.test(lookupValue)) {
    const { data: byId } = await supabase
      .from("orders")
      .select("*")
      .eq("id", lookupValue)
      .eq("user_id", user.id)
      .maybeSingle();
    order = byId;
  }

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*, product:products!product_id(name, slug, images:product_images(url, is_primary))")
    .eq("order_id", order.id);

  const groupedItems = Object.values(
    (items || []).reduce((acc: Record<string, any>, item: any) => {
      const key = `${item.product_id}-${item.variant_info || ""}-${item.unit_price}`;
      if (!acc[key]) {
        acc[key] = {
          ...item,
          quantity: 0,
          total_price: 0,
        };
      }
      acc[key].quantity += item.quantity || 0;
      acc[key].total_price += item.total_price || (item.unit_price || 0) * (item.quantity || 0);
      return acc;
    }, {})
  );

  const { data: returnRequest } = await supabase
    .from("order_return_requests")
    .select("status, return_shipping_company, return_barcode, admin_note")
    .eq("order_id", order.id)
    .maybeSingle();

  const shippingAddress = order.shipping_address_json as any;
  const orderExt = order as any;

  const RETURN_STATUS_LABELS: Record<string, string> = {
    requested: "Talep Alındı",
    approved: "Onaylandı",
    in_transit: "Kargoda",
    completed: "Tamamlandı",
    rejected: "Reddedildi",
  };

  const RETURN_STATUS_COLORS: Record<string, string> = {
    requested: "bg-amber-100 text-amber-800",
    approved: "bg-blue-100 text-blue-800",
    in_transit: "bg-indigo-100 text-indigo-800",
    completed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const RETURN_STATUS_MESSAGES: Record<string, string> = {
    requested: "İade talebiniz alındı. Ekibimiz kısa süre içinde inceleme yapacaktır.",
    approved: "İade talebiniz onaylandı. İade kargo bilgilerinizi takip ederek gönderim yapabilirsiniz.",
    in_transit: "İade gönderiniz kargoda görünüyor. Depo kontrolünden sonra süreç güncellenecektir.",
    completed: "İade süreci tamamlandı. Gerekli ödeme/işlem adımları sonuçlandırıldı.",
    rejected: "İade talebiniz reddedildi. Detay için iade notunu veya destek kanalını kontrol edin.",
  };

  const hasActiveReturn = !!returnRequest?.status && returnRequest.status !== "rejected";
  const displayOrderLabel = hasActiveReturn
    ? returnRequest?.status === "completed"
      ? "İade Tamamlandı"
      : "İade Sürecinde"
    : ORDER_STATUS_LABELS[order.status] || order.status;

  const displayOrderColor = hasActiveReturn
    ? returnRequest?.status === "completed"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800"
    : ORDER_STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800";

  const isShippedLike = ["shipped", "delivered"].includes(order.status);
  const hasTracking = !!order.cargo_tracking_number;
  const statusSteps = [
    { key: "pending", label: "Beklemede" },
    { key: "confirmed", label: "Onaylandı" },
    { key: "preparing", label: "Hazırlanıyor" },
    { key: "shipped", label: "Kargoda" },
    { key: "delivered", label: "Teslim" },
  ];
  const timelineIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <>
      <section className="bg-secondary/40 border-b">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-3 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
            <Link href="/" className="hover:text-primary transition-colors shrink-0">Anasayfa</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/hesabim" className="hover:text-primary transition-colors shrink-0">Hesabım</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/hesabim/siparislerim" className="hover:text-primary transition-colors shrink-0">Siparişlerim</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium shrink-0">{order.order_number}</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Sipariş Detayı</h1>
              <p className="text-sm text-muted-foreground mt-1">{order.order_number}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${displayOrderColor}`}>
                Sipariş: {displayOrderLabel}
              </span>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_COLORS[order.payment_status] || "bg-gray-100 text-gray-800"}`}>
                Ödeme: {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
              </span>
              {returnRequest?.status && (
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${RETURN_STATUS_COLORS[returnRequest.status] || "bg-amber-100 text-amber-800"}`}>
                  İade: {RETURN_STATUS_LABELS[returnRequest.status] || returnRequest.status}
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{formatDateTime(order.created_at)}</p>

          {returnRequest?.status && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-semibold text-amber-900">
                Bu sipariş için iade süreci aktif
              </p>
              <p className="text-sm text-amber-800 mt-1">
                {RETURN_STATUS_MESSAGES[returnRequest.status] || "İade talebiniz işleme alındı."}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-8 md:py-12 pb-24 md:pb-12">
        <div className="container mx-auto px-4">
          {timelineIndex >= 0 && !hasActiveReturn && (
            <div className="bg-white rounded-2xl border p-5 md:p-6 mb-5">
              <h2 className="font-semibold text-foreground mb-4">Sipariş Zaman Çizelgesi</h2>
              <div className="relative grid grid-cols-5">
                <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-border" />
                {timelineIndex > 0 && (
                  <div
                    className="absolute top-4 left-[10%] h-0.5 bg-primary"
                    style={{ width: `${(timelineIndex / (statusSteps.length - 1)) * 80}%` }}
                  />
                )}
                {statusSteps.map((step, i) => {
                  const done = i <= timelineIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div className={`relative z-10 w-8 h-8 rounded-full border-2 ${done ? "bg-primary border-primary" : "bg-white border-border"}`} />
                      <p className={`text-[11px] sm:text-xs mt-2 text-center ${done ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border p-5 md:p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Ürünler
                </h2>
                <div className="divide-y">
                  {groupedItems?.map((item: any) => {
                    const img = item.product?.images?.find((i: any) => i.is_primary)?.url || item.product?.images?.[0]?.url;
                    return (
                      <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="w-16 h-16 rounded-xl bg-secondary overflow-hidden shrink-0">
                          {img ? (
                            <img src={img} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.product?.slug || ""}`}
                            className="font-medium text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {item.product_name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.quantity} adet × {formatPrice(item.unit_price)}
                          </p>
                          {item.variant_info && (
                            <p className="text-xs text-muted-foreground mt-0.5">Varyant: {item.variant_info}</p>
                          )}
                        </div>
                        <p className="font-semibold text-sm shrink-0">
                          {formatPrice(item.total_price)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cargo */}
              <div className="bg-white rounded-2xl border p-5 md:p-6">
                <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Gönderi Kargo Bilgisi
                </h2>
                {!isShippedLike && !hasTracking && (
                  <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                    <p className="text-sm text-blue-800">
                      Siparişiniz henüz kargoya verilmedi. Bu yüzden takip numarası görünmemesi normaldir.
                    </p>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Kargo Firması</p>
                    <p className="text-foreground font-medium mt-0.5">{order.cargo_company || "Henüz atanmadı"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Takip Numarası</p>
                    <p className="font-mono text-foreground font-medium mt-0.5 break-all">{order.cargo_tracking_number || "Henüz oluşturulmadı"}</p>
                  </div>
                </div>
                {order.cargo_tracking_number && (
                  <Link
                    href={`/siparis-takip?no=${order.cargo_tracking_number}`}
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:underline underline-offset-4"
                  >
                    Kargoyu Takip Et
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              {/* Return Request */}
              <div className="space-y-3">
                {returnRequest && (
                  <div className="bg-white rounded-2xl border p-5 space-y-2">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-5 w-5 text-primary" />
                      <h2 className="font-semibold text-foreground">İade Durumu</h2>
                    </div>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Durum:</span> <span className="font-semibold">{RETURN_STATUS_LABELS[returnRequest.status] || returnRequest.status}</span>
                    </p>
                    {returnRequest.return_shipping_company && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">İade Kargo:</span> <span className="font-medium">{returnRequest.return_shipping_company}</span>
                      </p>
                    )}
                    {returnRequest.return_barcode && (
                      <p className="text-sm break-all">
                        <span className="text-muted-foreground">İade Barkodu:</span> <span className="font-mono font-semibold">{returnRequest.return_barcode}</span>
                      </p>
                    )}
                    {returnRequest.admin_note && (
                      <p className="text-sm text-muted-foreground">{returnRequest.admin_note}</p>
                    )}
                  </div>
                )}

                <ReturnRequestForm
                  orderId={order.id}
                  existingStatus={returnRequest?.status ? RETURN_STATUS_LABELS[returnRequest.status] || returnRequest.status : null}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-secondary/40 rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Ödeme Özeti
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ara Toplam</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kargo</span>
                    <span>{order.shipping_cost === 0 ? <span className="text-green-600">Ücretsiz</span> : formatPrice(order.shipping_cost)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>İndirim</span>
                      <span>-{formatPrice(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                    <span>Toplam</span>
                    <span className="text-lg">{formatPrice(order.total)}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Ödeme Durumu</span>
                    <span className="font-medium">{PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Ödeme Yöntemi</span>
                    <span className="font-medium">{mapPaymentMethod(order.payment_method)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Fatura No</span>
                    <span className="font-medium break-all text-right">{orderExt.invoice_number || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Invoice */}
              <div className="bg-white rounded-2xl border p-5">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Fatura
                </h3>
                {orderExt.invoice_url ? (
                  <a
                    href={orderExt.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
                  >
                    Faturayı Görüntüle / İndir
                    <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">Fatura henüz yüklenmemiş.</p>
                )}
              </div>

              {/* Address */}
              {shippingAddress && (
                <div className="bg-white rounded-2xl border p-5">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Teslimat Adresi
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="text-foreground font-medium">{shippingAddress.title}</p>
                    <p>{shippingAddress.first_name} {shippingAddress.last_name}</p>
                    <p>{shippingAddress.address_line}</p>
                    {shippingAddress.neighborhood && <p>{shippingAddress.neighborhood}</p>}
                    <p>{shippingAddress.district}, {shippingAddress.city} {shippingAddress.postal_code}</p>
                    <p>{shippingAddress.phone}</p>
                  </div>
                </div>
              )}

              {order.notes && (
                <div className="bg-white rounded-2xl border p-5">
                  <h3 className="font-semibold text-foreground mb-2">Sipariş Notunuz</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
