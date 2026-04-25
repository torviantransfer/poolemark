import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice, formatDate, formatDateTime } from "@/lib/helpers";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/constants";
import { ArrowLeft, Mail, Phone, MapPin, ShoppingCart } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminCustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: customer }, { data: orders }, { data: addresses }] = await Promise.all([
    supabase.from("users").select("*").eq("id", id).single(),
    supabase.from("orders").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
    supabase.from("addresses").select("*").eq("user_id", id),
  ]);

  if (!customer) notFound();

  const totalSpent = orders?.reduce((sum, o) => sum + (o.payment_status === "paid" ? o.total : 0), 0) || 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/musteriler" className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {customer.first_name} {customer.last_name}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kayıt: {formatDate(customer.created_at)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border shadow-sm p-5 text-center">
              <p className="text-2xl font-bold text-foreground">{orders?.length || 0}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sipariş</p>
            </div>
            <div className="bg-white rounded-2xl border shadow-sm p-5 text-center">
              <p className="text-2xl font-bold text-foreground">{formatPrice(totalSpent)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Toplam Harcama</p>
            </div>
            <div className="bg-white rounded-2xl border shadow-sm p-5 text-center">
              <p className="text-2xl font-bold text-foreground">{addresses?.length || 0}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Adres</p>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-5 pb-3">
              <h2 className="text-base font-semibold">Siparişler</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t text-left text-muted-foreground">
                    <th className="px-5 py-2.5 font-medium">Sipariş No</th>
                    <th className="px-5 py-2.5 font-medium">Tutar</th>
                    <th className="px-5 py-2.5 font-medium">Durum</th>
                    <th className="px-5 py-2.5 font-medium">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {orders && orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id} className="border-t hover:bg-secondary/20">
                        <td className="px-5 py-3">
                          <Link href={`/admin/siparisler/${order.id}`} className="text-primary font-medium hover:underline">
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-5 py-3 font-medium">{formatPrice(order.total)}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || ""}`}>
                            {ORDER_STATUS_LABELS[order.status] || order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground text-xs">{formatDateTime(order.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                        <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        Henüz sipariş yok
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-3">
            <h2 className="text-base font-semibold">İletişim</h2>
            <div className="text-sm space-y-2">
              <p className="flex items-center gap-2 text-foreground/80">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                {customer.email}
              </p>
              {customer.phone && (
                <p className="flex items-center gap-2 text-foreground/80">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {customer.phone}
                </p>
              )}
            </div>
          </div>

          {addresses && addresses.length > 0 && (
            <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-3">
              <h2 className="text-base font-semibold">Adresler</h2>
              {addresses.map((addr) => (
                <div key={addr.id} className="text-sm text-foreground/80 space-y-0.5 pb-3 border-b last:border-0 last:pb-0">
                  <p className="font-medium text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    {addr.title}
                    {addr.is_default && <span className="text-xs text-primary">(Varsayılan)</span>}
                  </p>
                  <p>{addr.address_line}</p>
                  <p>{addr.district} / {addr.city}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
