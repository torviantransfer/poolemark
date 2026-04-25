import Link from "next/link";
import {
  getAdminStats,
  getRecentOrders,
  getLowStockProducts,
  getTodayFunnelStats,
} from "@/services/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { formatPrice, formatDateTime } from "@/lib/helpers";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "@/constants";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  AlertTriangle,
  MessageSquare,
  Star,
  ArrowRight,
  Package,
  Eye,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

export default async function AdminDashboard() {
  const [stats, recentOrders, lowStock, funnel] = await Promise.all([
    getAdminStats().catch(() => ({
      totalCustomers: 0,
      todayOrders: 0,
      todayRevenue: 0,
      pendingOrders: 0,
      lowStockProducts: 0,
      unreadMessages: 0,
      pendingReviews: 0,
    })),
    getRecentOrders(10).catch(() => []),
    getLowStockProducts(5).catch(() => []),
    getTodayFunnelStats().catch(() => ({
      visitors: 0,
      pageViews: 0,
      addToCart: 0,
      initiateCheckout: 0,
      purchase: 0,
    })),
  ]);

  const cartRate = funnel.visitors > 0 ? (funnel.addToCart / funnel.visitors) * 100 : 0;
  const checkoutRate = funnel.addToCart > 0 ? (funnel.initiateCheckout / funnel.addToCart) * 100 : 0;
  const purchaseRate = funnel.visitors > 0 ? (funnel.purchase / funnel.visitors) * 100 : 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Mağaza genel bakış
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Bugünkü Satış"
          value={formatPrice(stats.todayRevenue)}
          color="text-green-600 bg-green-50"
        />
        <StatCard
          icon={<ShoppingCart className="h-5 w-5" />}
          label="Bugünkü Sipariş"
          value={stats.todayOrders.toString()}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Toplam Müşteri"
          value={stats.totalCustomers.toString()}
          color="text-purple-600 bg-purple-50"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Bekleyen Sipariş"
          value={stats.pendingOrders.toString()}
          color="text-amber-600 bg-amber-50"
        />
      </div>

      {/* Funnel Stats */}
      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Bugünkü Dönüşüm Hunisi</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tekil ziyaretçi bazında (toplam {funnel.pageViews} sayfa görüntüleme)
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <FunnelCard
            icon={<Eye className="h-4 w-4" />}
            label="Ziyaretçi"
            value={funnel.visitors}
            sub="100%"
            color="text-sky-600 bg-sky-50"
          />
          <FunnelCard
            icon={<ShoppingBag className="h-4 w-4" />}
            label="Sepete Ekleyen"
            value={funnel.addToCart}
            sub={`${cartRate.toFixed(1)}% ziyaretçinin`}
            color="text-indigo-600 bg-indigo-50"
          />
          <FunnelCard
            icon={<CreditCard className="h-4 w-4" />}
            label="Ödemeye Geçen"
            value={funnel.initiateCheckout}
            sub={`${checkoutRate.toFixed(1)}% sepetten`}
            color="text-fuchsia-600 bg-fuchsia-50"
          />
          <FunnelCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Satın Alan"
            value={funnel.purchase}
            sub={`${purchaseRate.toFixed(1)}% dönüşüm`}
            color="text-emerald-600 bg-emerald-50"
          />
        </div>
      </div>

      {/* Alert Cards */}
      {(stats.lowStockProducts > 0 ||
        stats.unreadMessages > 0 ||
        stats.pendingReviews > 0) && (
        <div className="flex flex-wrap gap-3">
          {stats.lowStockProducts > 0 && (
            <Link
              href="/admin/urunler"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm hover:bg-amber-100 transition-colors"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">{stats.lowStockProducts}</span> ürünün stoku düşük
            </Link>
          )}
          {stats.unreadMessages > 0 && (
            <Link
              href="/admin/mesajlar"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm hover:bg-blue-100 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">{stats.unreadMessages}</span> okunmamış mesaj
            </Link>
          )}
          {stats.pendingReviews > 0 && (
            <Link
              href="/admin/yorumlar"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-sm hover:bg-purple-100 transition-colors"
            >
              <Star className="h-4 w-4" />
              <span className="font-medium">{stats.pendingReviews}</span> onay bekleyen yorum
            </Link>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-base font-semibold text-foreground">
              Son Siparişler
            </h2>
            <Link
              href="/admin/siparisler"
              className="text-sm text-primary hover:underline underline-offset-4 flex items-center gap-1"
            >
              Tümü <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t text-left text-muted-foreground">
                  <th className="px-5 py-2.5 font-medium">Sipariş No</th>
                  <th className="px-5 py-2.5 font-medium">Müşteri</th>
                  <th className="px-5 py-2.5 font-medium">Tutar</th>
                  <th className="px-5 py-2.5 font-medium">Durum</th>
                  <th className="px-5 py-2.5 font-medium">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => {
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
                      className="border-t hover:bg-secondary/30 transition-colors"
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
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${displayStatusColor}`}
                        >
                          {displayStatusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">
                        {formatDateTime(order.created_at)}
                      </td>
                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-muted-foreground"
                    >
                      Henüz sipariş yok
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-base font-semibold text-foreground">
              Stok Uyarısı
            </h2>
            <Link
              href="/admin/urunler"
              className="text-sm text-primary hover:underline underline-offset-4"
            >
              Tümü
            </Link>
          </div>
          <div className="px-5 pb-5 space-y-3">
            {lowStock.length > 0 ? (
              lowStock.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/urunler/${product.id}`}
                  className="flex items-center justify-between py-2 group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <span
                    className={`ml-3 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                      product.stock_quantity === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {product.stock_quantity === 0
                      ? "Tükendi"
                      : `${product.stock_quantity} adet`}
                  </span>
                </Link>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Stok uyarısı yok
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5">
      <div
        className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${color}`}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground mt-3">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function FunnelCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${color}`}>
          {icon}
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}
