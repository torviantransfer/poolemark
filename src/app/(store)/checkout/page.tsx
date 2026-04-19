"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  MapPin,
  CreditCard,
  ShoppingBag,
  Loader2,
  ArrowLeft,
  Plus,
  Shield,
  Truck,
  CheckCircle2,
  User,
} from "lucide-react";
import { formatPrice } from "@/lib/helpers";
import type { Address } from "@/types";

interface GuestAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  postal_code: string;
  address_line: string;
}

const emptyGuest: GuestAddress = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  city: "",
  district: "",
  neighborhood: "",
  postal_code: "",
  address_line: "",
};

export default function CheckoutPage() {
  const { user, loading: authLoading } = useUser();
  const { items, subtotal, clearCart, loading: cartLoading } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [guestAddress, setGuestAddress] = useState<GuestAddress>(emptyGuest);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");

  const FREE_SHIPPING_THRESHOLD = 500;
  const SHIPPING_COST = 39.9;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  const isGuest = !authLoading && !user;

  const isGuestFormValid =
    !!guestAddress.first_name &&
    !!guestAddress.last_name &&
    !!guestAddress.email &&
    !!guestAddress.phone &&
    !!guestAddress.city &&
    !!guestAddress.district &&
    !!guestAddress.address_line;

  const canCheckout = isGuest ? isGuestFormValid : !!selectedAddressId;

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      loadAddresses();
    } else {
      setLoading(false); // guest — no addresses to fetch
    }
  }, [user, authLoading]);

  async function loadAddresses() {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    if (data) {
      setAddresses(data);
      const def = data.find((a) => a.is_default);
      setSelectedAddressId(def?.id || data[0]?.id || null);
    }
    setLoading(false);
  }

  const [paytrToken, setPaytrToken] = useState<string | null>(null);

  async function handlePlaceOrder() {
    if (items.length === 0) return;
    if (!canCheckout) return;

    startTransition(async () => {
      try {
        const orderItems = items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          name: item.name,
          variant_name: item.variant_name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        }));

        const body = isGuest
          ? {
              guestAddress,
              items: orderItems,
              subtotal,
              shipping,
              discount: 0,
              total,
              notes: notes || null,
            }
          : {
              addressId: selectedAddressId,
              items: orderItems,
              subtotal,
              shipping,
              discount: 0,
              total,
              notes: notes || null,
            };

        const res = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          alert(data.error || "Ödeme başlatılamadı.");
          return;
        }

        setPaytrToken(data.token);
        clearCart();
      } catch {
        alert("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    });
  }

  if (loading || cartLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0 && !paytrToken) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold">Sepetiniz boş</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sipariş verebilmek için sepetinize ürün ekleyin.
        </p>
        <Button render={<Link href="/products" />} className="mt-6">
          Alışverişe Başla
        </Button>
      </div>
    );
  }

  // PayTR iFrame view
  if (paytrToken) {
    return (
      <>
        <section className="bg-secondary/40 border-b">
          <div className="container mx-auto px-4 py-8 md:py-10">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Ödeme</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ödeme bilgilerinizi güvenli bir şekilde girin.
            </p>
          </div>
        </section>
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 p-5 border-b">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">256-bit SSL ile Güvenli Ödeme</span>
              </div>
              <iframe
                src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
                className="w-full min-h-[500px] border-0"
                id="paytriframe"
                frameBorder="0"
                scrolling="yes"
              />
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="bg-secondary/40 border-b">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/sepet" className="hover:text-primary transition-colors">Sepet</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Ödeme</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Siparişi Tamamla</h1>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address Selection */}
              <div className="bg-white rounded-2xl border p-5 md:p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  Teslimat Adresi
                </h2>

                {isGuest ? (
                  /* Guest address form */
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                      <User className="h-4 w-4 shrink-0" />
                      <span>
                        Üye olmadan sipariş veriyorsunuz.{" "}
                        <Link href="/giris?redirect=/checkout" className="font-semibold underline underline-offset-2 hover:text-blue-800">
                          Giriş yapmak ister misiniz?
                        </Link>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Ad *</label>
                        <Input
                          value={guestAddress.first_name}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, first_name: e.target.value }))}
                          placeholder="Adınız"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Soyad *</label>
                        <Input
                          value={guestAddress.last_name}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, last_name: e.target.value }))}
                          placeholder="Soyadınız"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">E-posta *</label>
                        <Input
                          type="email"
                          value={guestAddress.email}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, email: e.target.value }))}
                          placeholder="ornek@email.com"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Telefon *</label>
                        <Input
                          type="tel"
                          value={guestAddress.phone}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="0555 000 00 00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Adres *</label>
                      <Input
                        value={guestAddress.address_line}
                        onChange={(e) => setGuestAddress((p) => ({ ...p, address_line: e.target.value }))}
                        placeholder="Mahalle, cadde, sokak, kapı no..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Mahalle</label>
                        <Input
                          value={guestAddress.neighborhood}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, neighborhood: e.target.value }))}
                          placeholder="Mahalle"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Posta Kodu</label>
                        <Input
                          value={guestAddress.postal_code}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, postal_code: e.target.value }))}
                          placeholder="34000"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">İlçe *</label>
                        <Input
                          value={guestAddress.district}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, district: e.target.value }))}
                          placeholder="İlçe"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Şehir *</label>
                        <Input
                          value={guestAddress.city}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, city: e.target.value }))}
                          placeholder="İstanbul"
                        />
                      </div>
                    </div>
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          selectedAddressId === addr.id
                            ? "border-primary bg-accent/30"
                            : "border-transparent bg-secondary/40 hover:border-primary/20"
                        }`}
                      >
                        <p className="font-medium text-sm">{addr.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{addr.first_name} {addr.last_name}</p>
                        <p className="text-xs text-muted-foreground">{addr.address_line}</p>
                        <p className="text-xs text-muted-foreground">{addr.district}, {addr.city}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-3">
                      Kayıtlı adresiniz yok. Sipariş vermek için bir adres ekleyin.
                    </p>
                    <Button render={<Link href="/hesabim/adreslerim" />} variant="outline" size="sm" className="gap-1.5">
                      <Plus className="h-4 w-4" />
                      Adres Ekle
                    </Button>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-2xl border p-5 md:p-6">
                <h2 className="font-semibold mb-3">Sipariş Notu (Opsiyonel)</h2>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Sipariş ile ilgili not ekleyebilirsiniz..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Trust */}
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>256-bit SSL Güvenlik</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Hızlı Kargo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Kolay İade</span>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-secondary/40 rounded-2xl p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-foreground mb-4">Sipariş Özeti</h3>

                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-4 w-4 text-muted-foreground/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} adet</p>
                      </div>
                      <p className="text-sm font-semibold shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ara Toplam</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kargo</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">Ücretsiz</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between">
                    <span className="font-semibold">Toplam</span>
                    <span className="text-xl font-bold">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full mt-6 gap-2"
                  onClick={handlePlaceOrder}
                  disabled={isPending || !canCheckout}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  {isPending ? "İşleniyor..." : "Ödemeye Geç"}
                </Button>

                <Link
                  href="/sepet"
                  className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary mt-3 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Sepete Dön
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
