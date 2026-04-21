"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  ChevronRight,
  Loader2,
  Shield,
  Truck,
  CreditCard,
  Gift,
} from "lucide-react";
import { formatPrice } from "@/lib/helpers";
import { useState, useEffect } from "react";

export default function CartPage() {
  const { items, loading, itemCount, subtotal, updateQuantity, removeItem } =
    useCart();
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  const FREE_SHIPPING_THRESHOLD = 500;
  const SHIPPING_COST = 39.9;
  const discount = appliedCoupon?.discount || 0;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal - discount + shipping;

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Geçersiz kupon kodu.");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({ code: data.coupon.code, discount: data.discount });
        setCouponError("");
      }
    } catch {
      setCouponError("Bir hata oluştu.");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  }

  // Upsell: fetch recommended products
  const [recommended, setRecommended] = useState<
    { id: string; name: string; slug: string; price: number; compare_at_price: number | null; images: string[] }[]
  >([]);

  useEffect(() => {
    async function fetchRecommended() {
      try {
        const excludeIds = items.map((i) => i.product_id).join(",");
        const res = await fetch(`/api/products?limit=4&sort=popular&exclude=${excludeIds}`);
        if (res.ok) {
          const data = await res.json();
          setRecommended((data.products || []).slice(0, 4));
        }
      } catch { /* ignore */ }
    }
    if (items.length > 0) fetchRecommended();
  }, [items.length]);

  // Free shipping progress
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <section className="bg-secondary/40 border-b">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <Link href="/" className="hover:text-primary transition-colors">
              Anasayfa
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Sepet</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Sepetim
            {itemCount > 0 && (
              <span className="text-base font-normal text-muted-foreground ml-2">
                ({itemCount} ürün)
              </span>
            )}
          </h1>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {items.length === 0 ? (
            <div className="text-center py-16 md:py-24">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary/60 mb-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Sepetiniz boş
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                Henüz sepetinize ürün eklemediniz. Hemen alışverişe başlayın!
              </p>
              <Button
                render={<Link href="/products" />}
                size="lg"
                className="mt-6 gap-2"
              >
                Alışverişe Başla
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border p-4 flex gap-4"
                  >
                    <Link
                      href={`/products/${item.slug}`}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-secondary overflow-hidden shrink-0"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/products/${item.slug}`}
                            className="font-medium text-sm md:text-base text-foreground hover:text-primary transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          {item.variant_name && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.variant_name}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-end justify-between mt-3">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-3 text-sm font-medium min-w-[32px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Math.min(item.quantity + 1, item.stock_quantity)
                              )
                            }
                            disabled={item.quantity >= item.stock_quantity}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-base font-bold text-foreground">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          {item.compare_at_price && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatPrice(item.compare_at_price * item.quantity)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-secondary/40 rounded-2xl p-6 sticky top-24 space-y-5">
                  <h3 className="text-lg font-semibold text-foreground">
                    Sipariş Özeti
                  </h3>

                  {/* Free Shipping Progress Bar */}
                  <div className="bg-white rounded-xl p-3.5">
                    {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <Truck className="h-4 w-4" />
                        <span className="text-sm font-medium">🎉 Ücretsiz kargo kazandınız!</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Truck className="h-3.5 w-3.5" />
                            Ücretsiz kargo için
                          </span>
                          <span className="font-semibold text-primary">{formatPrice(remainingForFreeShipping)} kaldı</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${shippingProgress}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Coupon */}
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl mb-5">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">{appliedCoupon.code}</span>
                        <span className="text-xs text-green-600">(-{formatPrice(appliedCoupon.discount)})</span>
                      </div>
                      <button onClick={removeCoupon} className="text-xs text-red-500 hover:underline">Kaldır</button>
                    </div>
                  ) : (
                    <div className="mb-5">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Kupon kodu"
                            className="pl-9"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                          />
                        </div>
                        <Button variant="outline" onClick={applyCoupon} disabled={couponLoading}>
                          {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Uygula"}
                        </Button>
                      </div>
                      {couponError && <p className="text-xs text-destructive mt-1.5">{couponError}</p>}
                    </div>
                  )}

                  <div className="space-y-3 text-sm">
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
                    {discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">İndirim</span>
                        <span className="font-medium text-green-600">-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground">
                          Toplam
                        </span>
                        <span className="text-xl font-bold text-foreground">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    render={<Link href={appliedCoupon ? `/checkout?coupon=${appliedCoupon.code}` : "/checkout"} />}
                    size="lg"
                    className="w-full mt-6 gap-2"
                  >
                    Siparişi Tamamla
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <Link
                    href="/products"
                    className="block text-center text-sm text-muted-foreground hover:text-primary mt-3 transition-colors"
                  >
                    Alışverişe devam et
                  </Link>

                  {/* Trust Badges */}
                  <div className="mt-5 pt-4 border-t space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      <span>256-bit SSL ile güvenli ödeme</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CreditCard className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span>Tüm kartlara 12 taksit imkanı</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Gift className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                      <span>500₺ üzeri ücretsiz kargo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Upsell: Recommended Products */}
      {items.length > 0 && recommended.length > 0 && (
        <section className="py-8 md:py-12 border-t bg-secondary/20">
          <div className="container mx-auto px-4">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Bunları da Beğenebilirsiniz
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {recommended.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="bg-white rounded-xl border p-3 hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-square rounded-lg bg-secondary overflow-hidden mb-2">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs md:text-sm font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-sm font-bold text-foreground">{formatPrice(product.price)}</span>
                    {product.compare_at_price && (
                      <span className="text-[10px] text-muted-foreground line-through">{formatPrice(product.compare_at_price)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
