import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Package,
  ArrowRight,
  Home,
} from "lucide-react";
import { formatPrice } from "@/lib/helpers";

type OrderItemSummary = {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type ShippingAddressSummary = {
  district?: string;
  city?: string;
  address_line?: string;
};

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; status?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.order;
  const status = params.status || "success";
  const isSuccess = status === "success";

  let order: {
    id: string;
    order_number: string;
    subtotal: number;
    shipping_cost: number;
    discount_amount: number;
    total: number;
    shipping_address_json: ShippingAddressSummary | null;
    created_at: string;
  } | null = null;
  let orderItems: OrderItemSummary[] = [];
  let isLoggedIn = false;

  if (orderId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    isLoggedIn = !!user;
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, subtotal, shipping_cost, discount_amount, total, shipping_address_json, created_at")
      .eq("id", orderId)
      .single();
    order = data;

    if (order) {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name, quantity, unit_price, total_price")
        .eq("order_id", order.id)
        .order("created_at", { ascending: true });
      orderItems = items || [];
    }
  }

  const addressSummary = order?.shipping_address_json
    ? `${order.shipping_address_json.district || ""}${order.shipping_address_json.district ? " / " : ""}${order.shipping_address_json.city || ""}`
    : "Adres hesabım/sipariş takip ekranında görüntülenebilir";

  const shortAddressLine = order?.shipping_address_json?.address_line
    ? `${order.shipping_address_json.address_line.slice(0, 42)}${order.shipping_address_json.address_line.length > 42 ? "..." : ""}`
    : null;

  const visibleItems = orderItems.slice(0, 3);
  const hiddenItemCount = Math.max(0, orderItems.length - visibleItems.length);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        {isSuccess ? (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Siparişiniz Alındı!
            </h1>
            <p className="text-muted-foreground mt-3 max-w-sm mx-auto">
              Siparişiniz başarıyla oluşturuldu. Siparişinizin durumunu{" "}
              {isLoggedIn ? "hesabım sayfasından" : "sipariş takip sayfasından"}{" "}
              takip edebilirsiniz.
            </p>

            {order && (
              <div className="bg-white border rounded-2xl p-5 sm:p-6 mt-7 text-left shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 border-b">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Sipariş Numarası</p>
                    <p className="font-bold text-lg text-foreground mt-1">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground mt-1">{new Date(order.created_at).toLocaleString("tr-TR")}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Toplam</p>
                    <p className="text-xl font-bold text-primary mt-1">{formatPrice(order.total)}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-sm font-semibold text-foreground">Sipariş Özeti</p>
                  <ul className="mt-3 space-y-2">
                    {visibleItems.map((item, index) => (
                      <li key={`${item.product_name}-${index}`} className="flex items-start justify-between gap-3 text-sm">
                        <p className="text-foreground/90">
                          {item.product_name} <span className="text-muted-foreground">x {item.quantity}</span>
                        </p>
                        <p className="font-medium text-foreground whitespace-nowrap">{formatPrice(item.total_price)}</p>
                      </li>
                    ))}
                  </ul>
                  {hiddenItemCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">+{hiddenItemCount} ürün daha</p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-semibold text-foreground">Teslimat Adresi</p>
                  {shortAddressLine ? <p className="text-sm text-foreground/90 mt-2">{shortAddressLine}</p> : null}
                  <p className="text-sm text-muted-foreground mt-1">{addressSummary}</p>
                </div>

                <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ara Toplam</span>
                    <span className="text-foreground">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Kargo</span>
                    <span className="text-foreground">{formatPrice(order.shipping_cost)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">İndirim</span>
                      <span className="text-green-700">-{formatPrice(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t pt-2 mt-2">
                    <span className="font-semibold text-foreground">Genel Toplam</span>
                    <span className="font-bold text-foreground">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              {order && isLoggedIn && (
                <Button
                  render={<Link href={`/hesabim/siparislerim/${encodeURIComponent(order.order_number)}`} />}
                  className="gap-2"
                >
                  <Package className="h-4 w-4" />
                  Siparişi Görüntüle
                </Button>
              )}
              {order && !isLoggedIn && (
                <Button
                  render={<Link href={`/siparis-takip?no=${order.order_number}`} />}
                  className="gap-2"
                >
                  <Package className="h-4 w-4" />
                  Sipariş Takip
                </Button>
              )}
              <Button
                render={<Link href="/" />}
                variant="outline"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Anasayfaya Dön
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Ödeme Başarısız
            </h1>
            <p className="text-muted-foreground mt-3 max-w-sm mx-auto">
              Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin veya
              farklı bir ödeme yöntemi kullanın.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Button
                render={<Link href="/sepet" />}
                className="gap-2"
              >
                Tekrar Dene
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                render={<Link href="/" />}
                variant="outline"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Anasayfaya Dön
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
