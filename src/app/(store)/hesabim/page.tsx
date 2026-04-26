import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/helpers";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/constants";
import {
  Package,
  Heart,
  ShoppingBag,
  ChevronRight,
  TrendingUp,
  Clock,
} from "lucide-react";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/giris?redirect=/hesabim");

  const [{ data: profile }, { data: orders }, { count: favoriteCount }] =
    await Promise.all([
      supabase.from("users").select("first_name, last_name").eq("id", user.id).single(),
      supabase
        .from("orders")
        .select("id, order_number, total, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  const totalSpent = orders?.reduce((sum, o) => sum + (o.total || 0), 0) ?? 0;
  const activeOrders =
    orders?.filter((o) => !["delivered", "cancelled", "returned"].includes(o.status)).length ?? 0;

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Hoş geldin, {profile?.first_name || "Kullanıcı"} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Hesap özetinize buradan ulaşabilirsiniz.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Toplam Sipariş</p>
            <Package className="h-4 w-4 text-primary opacity-70" />
          </div>
          <p className="text-2xl font-bold text-foreground">{orders?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Toplam Harcama</p>
            <TrendingUp className="h-4 w-4 text-primary opacity-70" />
          </div>
          <p className="text-2xl font-bold text-foreground">{formatPrice(totalSpent)}</p>
        </div>
        <div className="bg-white rounded-2xl border p-4 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Aktif Sipariş</p>
            <Clock className="h-4 w-4 text-primary opacity-70" />
          </div>
          <p className="text-2xl font-bold text-foreground">{activeOrders}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Son Siparişlerim
          </h2>
          <Link
            href="/hesabim/siparislerim"
            className="text-xs text-primary hover:underline underline-offset-4 flex items-center gap-1"
          >
            Tümünü Gör <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {orders && orders.length > 0 ? (
          <div className="divide-y">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/hesabim/siparislerim/${encodeURIComponent(order.order_number)}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-secondary/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      ORDER_STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </span>
                  <span className="font-bold text-sm text-foreground tabular-nums">
                    {formatPrice(order.total)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-foreground">Henüz siparişiniz yok</p>
            <p className="text-xs text-muted-foreground mt-1">İlk siparişinizi vermek için alışverişe başlayın.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-3 hover:underline underline-offset-4"
            >
              Ürünlere Göz At <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/hesabim/adreslerim"
          className="bg-white rounded-2xl border p-4 hover:border-primary/40 hover:shadow-sm transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Adreslerim</p>
            <p className="text-xs text-muted-foreground">Teslimat adreslerinizi yönetin</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
        </Link>
        <Link
          href="/hesabim/favorilerim"
          className="bg-white rounded-2xl border p-4 hover:border-primary/40 hover:shadow-sm transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Favorilerim</p>
            <p className="text-xs text-muted-foreground">
              {favoriteCount ? `${favoriteCount} kayıtlı ürün` : "Favori ürün eklenmemiş"}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
        </Link>
      </div>
    </div>
  );
}
