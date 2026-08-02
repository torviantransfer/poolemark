import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Package,
  ArrowRight,
  Home,
} from "lucide-react";
import { formatPrice } from "@/lib/helpers";
import { PurchaseTracker } from "@/components/store/purchase-tracker";

type OrderItemSummary = {
  product_id?: string;
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

function toSafeNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; status?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.order;
  const isValidOrderId =
    typeof orderId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId);
  const status = params.status || "success";
  const isCod = status === "cod";
  const isSuccess = status === "success" || isCod;

  let order: {
    id: string;
    order_number: string;
    subtotal: number;
    shipping_cost: number;
    discount_amount: number;
    total: number;
    cod_fee?: number | null;
    shipping_address_json: ShippingAddressSummary | null;
    created_at: string;
  } | null = null;
  let orderItems: OrderItemSummary[] = [];
  let isLoggedIn = false;
  let loggedInUserId: string | null = null;
  let loggedInUserEmail: string | null = null;

  if (isValidOrderId) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      isLoggedIn = !!user;
      loggedInUserId = user?.id ?? null;
      loggedInUserEmail = user?.email ?? null;
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, subtotal, shipping_cost, discount_amount, total, cod_fee, shipping_address_json, created_at")
        .eq("id", orderId)
        .maybeSingle();
      order = data;

      if (order) {
        const { data: items } = await supabase
          .from("order_items")
          .select("product_id, product_name, quantity, unit_price, total_price")
          .eq("order_id", order.id)
          .order("created_at", { ascending: true });
        orderItems = items || [];
      }

      // Guest checkout result page fallback:
      // if anon/RLS blocks read, use server-side service role to load only this order.
      if (!order && isSuccess) {
        const admin = createAdminClient();
        if (admin) {
          const { data: adminOrder } = await admin
            .from("orders")
            .select("id, order_number, subtotal, shipping_cost, discount_amount, total, cod_fee, shipping_address_json, created_at")
            .eq("id", orderId)
            .maybeSingle();

          order = adminOrder || null;

          if (order) {
            const { data: adminItems } = await admin
              .from("order_items")
              .select("product_id, product_name, quantity, unit_price, total_price")
              .eq("order_id", order.id)
              .order("created_at", { ascending: true });
            orderItems = adminItems || [];
          }
        }
      }
    } catch {
      // Render graceful success/fail UI even if order lookup fails.
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
  const subtotal = toSafeNumber(order?.subtotal);
  const shippingCost = toSafeNumber(order?.shipping_cost);
  const discountAmount = toSafeNumber(order?.discount_amount);
  const codFee = toSafeNumber(order?.cod_fee);
  const total = toSafeNumber(order?.total);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        {isSuccess && order ? (
          <PurchaseTracker
            orderId={order.id}
            orderNumber={order.order_number}
            total={total}
            contentIds={orderItems
              .map((i) => i.product_id)
              .filter((id): id is string => Boolean(id))}
            contents={orderItems
              .filter((i) => i.product_id)
              .map((i) => ({
                id: i.product_id as string,
                quantity: toSafeNumber(i.quantity),
                item_price: toSafeNumber(i.unit_price),
              }))}
            userEmail={loggedInUserEmail}
            externalId={loggedInUserId}
          />
        ) : null}
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

            {isCod && (
              <div className="bg-white border border-green-200 rounded-2xl p-5 mt-5 max-w-md mx-auto text-left shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-green-100 shrink-0">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-green-600">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Kapıda Ödeme — WhatsApp Onayı</p>
                    <p className="text-xs text-muted-foreground">Siparişinizin işleme alınması için onayınız gerekiyor</p>
                  </div>
                </div>
                <ol className="mt-4 space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 text-[11px] font-bold shrink-0 mt-0.5">1</span>
                    WhatsApp numaranıza sipariş onay mesajı gönderdik.
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 text-[11px] font-bold shrink-0 mt-0.5">2</span>
                    Mesajdaki <strong>“Onaylıyorum”</strong> butonuna dokunun.
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 text-[11px] font-bold shrink-0 mt-0.5">3</span>
                    Onayınızın ardından siparişiniz hazırlanıp kargoya verilir.
                  </li>
                </ol>
                <p className="mt-3 text-xs text-muted-foreground bg-secondary/40 rounded-lg px-3 py-2">
                  Mesaj birkaç dakika içinde ulaşmazsa lütfen bizimle iletişime geçin.
                </p>
              </div>
            )}

            {order && (
              <div className="bg-white border rounded-2xl p-5 sm:p-6 mt-7 text-left shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 border-b">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Sipariş Numarası</p>
                    <p className="font-bold text-lg text-foreground mt-1">{order.order_number || "-"}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.created_at ? new Date(order.created_at).toLocaleString("tr-TR") : "-"}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Toplam</p>
                    <p className="text-xl font-bold text-primary mt-1">{formatPrice(total)}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-sm font-semibold text-foreground">Sipariş Özeti</p>
                  <ul className="mt-3 space-y-2">
                    {visibleItems.map((item, index) => (
                      <li key={`${item.product_name}-${index}`} className="flex items-start justify-between gap-3 text-sm">
                        <p className="text-foreground/90">
                          {item.product_name || "Ürün"} <span className="text-muted-foreground">x {toSafeNumber(item.quantity)}</span>
                        </p>
                        <p className="font-medium text-foreground whitespace-nowrap">{formatPrice(toSafeNumber(item.total_price))}</p>
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
                    <span className="text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Kargo</span>
                    <span className="text-foreground">{formatPrice(shippingCost)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">İndirim</span>
                      <span className="text-green-700">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  {codFee > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Kapıda Ödeme Bedeli</span>
                      <span className="text-foreground">{formatPrice(codFee)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t pt-2 mt-2">
                    <span className="font-semibold text-foreground">Genel Toplam</span>
                    <span className="font-bold text-foreground">{formatPrice(total)}</span>
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
