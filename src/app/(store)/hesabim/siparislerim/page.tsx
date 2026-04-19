import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Package,
  Eye,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/helpers";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ITEMS_PER_PAGE } from "@/constants";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/giris?redirect=/hesabim/siparislerim");

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: orders, count } = await supabase
    .from("orders")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <>
      <section className="bg-secondary/40 border-b">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/hesabim" className="hover:text-primary transition-colors">Hesabım</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Siparişlerim</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Siparişlerim</h1>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/hesabim/siparislerim/${order.id}`}
                  className="block bg-white rounded-2xl border p-5 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}>
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </span>
                      <span className="font-bold text-foreground">{formatPrice(order.total)}</span>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-6">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/hesabim/siparislerim?page=${p}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-primary text-white"
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-lg font-semibold text-foreground">Henüz siparişiniz yok</h2>
              <p className="text-sm text-muted-foreground mt-1">
                İlk siparişinizi vermek için alışverişe başlayın.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-4 hover:underline underline-offset-4"
              >
                Ürünlere Göz At <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
