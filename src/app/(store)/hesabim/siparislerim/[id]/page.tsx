import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Package,
  MapPin,
  CreditCard,
  Truck,
} from "lucide-react";
import { formatPrice, formatDateTime } from "@/lib/helpers";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "@/constants";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/giris");

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*, product:products!product_id(name, slug, images:product_images(url, is_primary))")
    .eq("order_id", order.id);

  const shippingAddress = order.shipping_address_json as any;

  return (
    <>
      <section className="bg-secondary/40 border-b">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/hesabim" className="hover:text-primary transition-colors">Hesabım</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/hesabim/siparislerim" className="hover:text-primary transition-colors">Siparişlerim</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{order.order_number}</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{order.order_number}</h1>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}>
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{formatDateTime(order.created_at)}</p>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border p-5 md:p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Ürünler
                </h2>
                <div className="divide-y">
                  {items?.map((item: any) => {
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
                        </div>
                        <p className="font-semibold text-sm shrink-0">
                          {formatPrice(item.total_price)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cargo Tracking */}
              {order.cargo_tracking_number && (
                <div className="bg-white rounded-2xl border p-5 md:p-6">
                  <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Kargo Takibi
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Kargo Firması</p>
                      <p className="text-foreground font-medium mt-0.5">{order.cargo_company || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Takip Numarası</p>
                      <p className="font-mono text-foreground font-medium mt-0.5 break-all">{order.cargo_tracking_number}</p>
                    </div>
                  </div>
                  <Link
                    href={`/siparis-takip?no=${order.cargo_tracking_number}`}
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:underline underline-offset-4"
                  >
                    Kargoyu Takip Et
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
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
                <div className="mt-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${PAYMENT_STATUS_COLORS[order.payment_status] || "bg-gray-100 text-gray-800"}`}>
                    {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                  </span>
                </div>
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
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
