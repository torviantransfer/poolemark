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

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; status?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.order;
  const status = params.status || "success";
  const isSuccess = status === "success";

  let order: any = null;

  if (orderId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, total, created_at")
      .eq("id", orderId)
      .single();
    order = data;
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-lg text-center">
        {isSuccess ? (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Siparişiniz Alındı!
            </h1>
            <p className="text-muted-foreground mt-3 max-w-sm mx-auto">
              Siparişiniz başarıyla oluşturuldu. Siparişinizin durumunu hesabım
              sayfasından takip edebilirsiniz.
            </p>

            {order && (
              <div className="bg-secondary/40 rounded-2xl p-5 mt-6 inline-block">
                <p className="text-sm text-muted-foreground">Sipariş Numarası</p>
                <p className="font-bold text-lg text-foreground mt-1">
                  {order.order_number}
                </p>
                <p className="text-sm font-semibold text-primary mt-1">
                  {formatPrice(order.total)}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              {order && (
                <Button
                  render={<Link href={`/hesabim/siparislerim/${order.id}`} />}
                  className="gap-2"
                >
                  <Package className="h-4 w-4" />
                  Siparişi Görüntüle
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
