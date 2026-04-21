"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
import { CITY_LIST, TURKEY_CITIES } from "@/constants/turkey";
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

interface ShippingCompanyOption {
  id: string;
  name: string;
  code: string;
  price: number;
  free_shipping_threshold: number | null;
  estimated_days: string | null;
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
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompanyOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");

  const selectedShipping = shippingCompanies.find((s) => s.id === selectedShippingId) || null;
  const shipping = selectedShipping
    ? selectedShipping.free_shipping_threshold && subtotal >= selectedShipping.free_shipping_threshold
      ? 0
      : selectedShipping.price
    : 0;

  const searchParams = useSearchParams();
  const couponCode = searchParams.get("coupon") || "";
  const total = subtotal + shipping; // Server will recalculate with coupon

  const isGuest = !authLoading && !user;

  const isGuestFormValid =
    !!guestAddress.first_name &&
    !!guestAddress.last_name &&
    !!guestAddress.email &&
    !!guestAddress.phone &&
    !!guestAddress.city &&
    !!guestAddress.district &&
    !!guestAddress.address_line;

  const canCheckout = (isGuest ? isGuestFormValid : !!selectedAddressId) && !!selectedShippingId;

  useEffect(() => {
    loadShippingCompanies();
    if (authLoading) return;
    if (user) {
      loadAddresses();
    } else {
      setLoading(false); // guest — no addresses to fetch
    }
  }, [user, authLoading]);

  async function loadShippingCompanies() {
    const supabase = createClient();
    const { data } = await supabase
      .from("shipping_companies")
      .select("id, name, code, price, free_shipping_threshold, estimated_days")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      setShippingCompanies(data);
      setSelectedShippingId((prev) => prev || data[0].id);
    }
  }

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
              shippingCompanyId: selectedShippingId,
              couponCode: couponCode || undefined,
              notes: notes || null,
            }
          : {
              addressId: selectedAddressId,
              items: orderItems,
              shippingCompanyId: selectedShippingId,
              couponCode: couponCode || undefined,
              notes: notes || null,
            };

        const res = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          toast.error(data.error || "Ödeme başlatılamadı. Lütfen tekrar deneyin.");
          return;
        }

        setPaytrToken(data.token);
        clearCart();
      } catch {
        toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
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
                className="w-full min-h-[400px] md:min-h-[500px] border-0"
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
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Ad *</Label>
                        <Input
                          value={guestAddress.first_name}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, first_name: e.target.value }))}
                          placeholder="Adınız"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Soyad *</Label>
                        <Input
                          value={guestAddress.last_name}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, last_name: e.target.value }))}
                          placeholder="Soyadınız"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>E-posta *</Label>
                        <Input
                          type="email"
                          value={guestAddress.email}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, email: e.target.value }))}
                          placeholder="ornek@email.com"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Telefon *</Label>
                        <Input
                          type="tel"
                          value={guestAddress.phone}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="0555 000 00 00"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Adres *</Label>
                      <Input
                        value={guestAddress.address_line}
                        onChange={(e) => setGuestAddress((p) => ({ ...p, address_line: e.target.value }))}
                        placeholder="Mahalle, cadde, sokak, kapı no..."
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Mahalle</Label>
                        <Input
                          value={guestAddress.neighborhood}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, neighborhood: e.target.value }))}
                          placeholder="Mahalle"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Posta Kodu</Label>
                        <Input
                          value={guestAddress.postal_code}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, postal_code: e.target.value }))}
                          placeholder="34000"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Şehir *</Label>
                        <select
                          value={guestAddress.city}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, city: e.target.value, district: "" }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Şehir seçiniz</option>
                          {CITY_LIST.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>İlçe *</Label>
                        <select
                          value={guestAddress.district}
                          onChange={(e) => setGuestAddress((p) => ({ ...p, district: e.target.value }))}
                          disabled={!guestAddress.city}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">İlçe seçiniz</option>
                          {guestAddress.city && TURKEY_CITIES[guestAddress.city]?.map((district) => (
                            <option key={district} value={district}>{district}</option>
                          ))}
                        </select>
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

              {/* Shipping Company Selection */}
              <div className="bg-white rounded-2xl border p-5 md:p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-4">
                  <Truck className="h-5 w-5 text-primary" />
                  Kargo Seçimi
                </h2>

                {shippingCompanies.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {shippingCompanies.map((company) => {
                      const isFree = company.free_shipping_threshold && subtotal >= company.free_shipping_threshold;
                      return (
                        <button
                          key={company.id}
                          onClick={() => setSelectedShippingId(company.id)}
                          className={`text-left p-4 rounded-xl border-2 transition-all ${
                            selectedShippingId === company.id
                              ? "border-primary bg-accent/30"
                              : "border-transparent bg-secondary/40 hover:border-primary/20"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm">{company.name}</p>
                            <span className="text-sm font-semibold text-foreground">
                              {isFree ? "Ücretsiz" : formatPrice(company.price)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {company.estimated_days || "1-3 İş Günü"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aktif kargo firması bulunamadı.</p>
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
              <div className="bg-white rounded-2xl border p-5 md:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-xs font-medium text-foreground">256-bit SSL</span>
                    <span className="text-[10px] text-muted-foreground">Güvenli Ödeme</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-foreground">Hızlı Kargo</span>
                    <span className="text-[10px] text-muted-foreground">{selectedShipping?.estimated_days || "1-3 İş Günü"}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium text-foreground">Kolay İade</span>
                    <span className="text-[10px] text-muted-foreground">14 Gün İçinde</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-orange-600" />
                    </div>
                    <span className="text-xs font-medium text-foreground">12 Taksit</span>
                    <span className="text-[10px] text-muted-foreground">Tüm Kartlara</span>
                  </div>
                </div>

                {/* Payment Logos */}
                <div className="mt-5 pt-4 border-t">
                  <p className="text-[10px] text-muted-foreground text-center mb-2">Desteklenen Ödeme Yöntemleri</p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <div className="bg-secondary/60 rounded px-2 py-1 text-[10px] font-semibold text-foreground/70">VISA</div>
                    <div className="bg-secondary/60 rounded px-2 py-1 text-[10px] font-semibold text-foreground/70">Mastercard</div>
                    <div className="bg-secondary/60 rounded px-2 py-1 text-[10px] font-semibold text-foreground/70">Troy</div>
                    <div className="bg-secondary/60 rounded px-2 py-1 text-[10px] font-semibold text-foreground/70">Bonus</div>
                    <div className="bg-secondary/60 rounded px-2 py-1 text-[10px] font-semibold text-foreground/70">World</div>
                    <div className="bg-secondary/60 rounded px-2 py-1 text-[10px] font-semibold text-foreground/70">Maximum</div>
                    <div className="bg-secondary/60 rounded px-2 py-1 text-[10px] font-semibold text-foreground/70">CardFinans</div>
                    <div className="bg-secondary/60 rounded px-2 py-1 text-[10px] font-semibold text-foreground/70">Axess</div>
                  </div>
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
                          <Image src={item.image} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
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
                    <span className="text-muted-foreground">
                      Kargo{selectedShipping ? ` (${selectedShipping.name})` : ""}
                    </span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">Ücretsiz</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {couponCode && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kupon ({couponCode})</span>
                      <span className="font-medium text-green-600">Uygulanacak</span>
                    </div>
                  )}
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
