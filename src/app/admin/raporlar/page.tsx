import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/helpers";
import { BarChart3, TrendingUp, ShoppingCart, Users, Package } from "lucide-react";

export default async function AdminReportsPage() {
  const supabase = await createClient();

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

  const [
    { data: thisMonthOrders },
    { data: lastMonthOrders },
    { count: totalProducts },
    { count: totalCustomers },
    { count: totalOrders },
    { data: allOrders },
  ] = await Promise.all([
    supabase.from("orders").select("total, payment_status").gte("created_at", thisMonthStart).eq("payment_status", "paid"),
    supabase.from("orders").select("total, payment_status").gte("created_at", lastMonthStart).lte("created_at", lastMonthEnd).eq("payment_status", "paid"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "customer"),
    // Toplam sipariş sayısı: yarım bırakılan ödemeleri (payment_status=pending) hariç tut.
    supabase.from("orders").select("*", { count: "exact", head: true }).neq("payment_status", "pending"),
    supabase.from("orders").select("total, payment_status").eq("payment_status", "paid"),
  ]);

  const thisMonthRevenue = thisMonthOrders?.reduce((s, o) => s + o.total, 0) || 0;
  const lastMonthRevenue = lastMonthOrders?.reduce((s, o) => s + o.total, 0) || 0;
  const totalRevenue = allOrders?.reduce((s, o) => s + o.total, 0) || 0;
  const revenueChange = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Raporlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Mağaza performansı</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-50 text-green-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold mt-3">{formatPrice(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">Toplam Gelir</p>
        </div>
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold mt-3">{totalOrders || 0}</p>
          <p className="text-xs text-muted-foreground">Toplam Sipariş</p>
        </div>
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 text-purple-600">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold mt-3">{totalCustomers || 0}</p>
          <p className="text-xs text-muted-foreground">Toplam Müşteri</p>
        </div>
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-600">
            <Package className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold mt-3">{totalProducts || 0}</p>
          <p className="text-xs text-muted-foreground">Aktif Ürün</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="text-base font-semibold mb-4">Bu Ay</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Gelir</span>
              <span className="text-lg font-bold">{formatPrice(thisMonthRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sipariş</span>
              <span className="text-lg font-bold">{thisMonthOrders?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ort. Sipariş</span>
              <span className="text-lg font-bold">
                {thisMonthOrders?.length ? formatPrice(thisMonthRevenue / thisMonthOrders.length) : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="text-base font-semibold mb-4">Geçen Ay</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Gelir</span>
              <span className="text-lg font-bold">{formatPrice(lastMonthRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sipariş</span>
              <span className="text-lg font-bold">{lastMonthOrders?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Değişim</span>
              <span className={`text-lg font-bold ${revenueChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {revenueChange >= 0 ? "+" : ""}{revenueChange.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
