import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ACCOUNT_NAV_LINKS } from "@/constants";
import { formatPrice } from "@/lib/helpers";
import {
  Package,
  Heart,
  MapPin,
  User,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard: Package,
  Package,
  MapPin,
  Heart,
  User,
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/giris?redirect=/hesabim");

  const [{ data: profile }, { data: orders }, { count: favoriteCount }] =
    await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).single(),
      supabase
        .from("orders")
        .select("id, order_number, total, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  return (
    <>
      <section className="bg-secondary/40 border-b">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <Link href="/" className="hover:text-primary transition-colors">
              Anasayfa
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Hesabım</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Hoş geldin, {profile?.first_name || "Kullanıcı"}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {ACCOUNT_NAV_LINKS.filter((l) => l.href !== "/hesabim").map(
              (link) => {
                const Icon = ICON_MAP[link.icon] || Package;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="bg-white rounded-2xl border p-5 hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <Icon className="h-6 w-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <p className="font-medium text-sm text-foreground">
                      {link.label}
                    </p>
                  </Link>
                );
              }
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Son Siparişlerim</h2>
              <Link
                href="/hesabim/siparislerim"
                className="text-sm text-primary hover:underline underline-offset-4"
              >
                Tümünü Gör
              </Link>
            </div>

            {orders && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/hesabim/siparislerim/${order.id}`}
                    className="flex items-center justify-between py-3 border-b last:border-0 hover:bg-secondary/30 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Henüz siparişiniz yok
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
