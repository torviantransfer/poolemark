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
import { Skeleton } from "@/components/ui/skeleton";
import { InstallmentModal } from "@/components/store/installment-modal";

function extractCoverageM2(productName: string): number | null {
  // Matches: "1.1 m²", "0,18 m2", "~1.32 m²" etc.
  const match = productName.match(/~?(\d+(?:[.,]\d+)?)\s*m(?:²|2)/i);
  if (!match) return null;

  const parsed = Number(match[1].replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export default function CartPage() {
  const { items, loading, mounted, itemCount, subtotal, updateQuantity, removeItem } =
    useCart();
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  const FREE_SHIPPING_THRESHOLD = 500;
  const discount = appliedCoupon?.discount || 0;
  const freeShippingEarned = subtotal >= FREE_SHIPPING_THRESHOLD;
  const total = subtotal - discount;
  const kdv = total * 20 / 120; // Fiyatlar KDV dahil olduğundan içeriden hesaplanır

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

  if (!mounted || loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-4 lg:gap-8">
          <div className="lg:col-span-2 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-4 flex gap-4">
                <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-xl" />
                <div className="flex-1 space-y-2.5">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-36" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-secondary/40 rounded-2xl p-4 md:p-6 space-y-4 h-fit">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
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

      <section className="py-8 md:py-12 pb-28 md:pb-12">
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
            <div className="grid md:grid-cols-3 gap-4 lg:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-3">
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

                      {(() => {
                        const coveragePerPack = extractCoverageM2(item.name);
                        if (!coveragePerPack) return null;

                        const totalCoverage = coveragePerPack * item.quantity;
                        const recommendedCoverage = totalCoverage * 1.1;

                        return (
                          <div className="mt-3 pt-2 border-t border-border/50">
                            <p className="text-[11px] text-muted-foreground">
                              Toplam kaplama alanı: <span className="font-semibold text-foreground">{totalCoverage.toFixed(2)} m²</span>
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              %10 fire ile önerilen: <span className="font-medium text-foreground">{recommendedCoverage.toFixed(2)} m²</span>
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ))}
                </div>

                {/* Önerilen Ürünler - Sol Kolon */}
                {recommended.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Gift className="h-4 w-4 text-primary" />
                      Bunlarda Önerilen Ürünler
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {recommended.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          className="bg-white rounded-xl border p-3 hover:shadow-md transition-shadow group flex gap-3 items-center"
                        >
                          <div className="w-14 h-14 rounded-lg bg-secondary overflow-hidden shrink-0">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="h-5 w-5 text-muted-foreground/20" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                              {product.name}
                            </p>
                            <div className="mt-1 flex items-center gap-1">
                              <span className="text-sm font-bold text-foreground">{formatPrice(product.price)}</span>
                              {product.compare_at_price && (
                                <span className="text-[10px] text-muted-foreground line-through">{formatPrice(product.compare_at_price)}</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-secondary/40 rounded-2xl p-4 md:p-6 lg:sticky lg:top-24 space-y-5">
                  <h3 className="text-lg font-semibold text-foreground">
                    Sipariş Özeti
                  </h3>

                  {/* Free Shipping Progress Bar */}
                  <div className="bg-white rounded-xl p-3.5 border border-border/40">
                    {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                      <div className="flex items-center gap-2 text-primary">
                        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10">
                          <Truck className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-semibold">Ücretsiz kargo kazandınız</span>
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
                        {freeShippingEarned ? (
                          <span className="text-green-600">Ücretsiz</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Ödeme adımında hesaplanır</span>
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
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">KDV (%20) dahil</span>
                        <span className="text-xs text-muted-foreground">{formatPrice(kdv)}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <InstallmentModal price={total} />
                    </div>
                  </div>

                  <Button
                    render={<Link href={appliedCoupon ? `/checkout?coupon=${appliedCoupon.code}` : "/checkout"} />}
                    size="lg"
                    className="w-full mt-6 gap-2"
                  >
                    Güvenli Ödemeye Geç
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <Link
                    href="/products"
                    className="block text-center text-sm text-muted-foreground hover:text-primary mt-3 transition-colors"
                  >
                    Alışverişe devam et
                  </Link>

                  {/* Trust Badges */}
                  <div className="mt-5 pt-4 border-t grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center text-center gap-1.5 p-2 rounded-lg bg-white border border-border/40">
                      <Shield className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-[11px] leading-tight text-muted-foreground">256-bit SSL güvenli ödeme</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-1.5 p-2 rounded-lg bg-white border border-border/40">
                      <CreditCard className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-[11px] leading-tight text-muted-foreground">Tüm kartlara 12 taksit</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-1.5 p-2 rounded-lg bg-white border border-border/40">
                      <Gift className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-[11px] leading-tight text-muted-foreground">500₺ üzeri ücretsiz kargo</span>
                    </div>
                  </div>

                  {/* Ödeme Logosu */}
                  <div className="pt-4 border-t">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/payment-methods/kart-odeme-guvenli.png"
                      alt="Güvenli ödeme yöntemleri"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile sticky CTA */}
      {items.length > 0 && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.06)] p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-none">Toplam</p>
              <p className="text-base font-bold text-foreground tabular-nums leading-tight mt-0.5">{formatPrice(total)}</p>
            </div>
            <Button
              render={<Link href={appliedCoupon ? `/checkout?coupon=${appliedCoupon.code}` : "/checkout"} />}
              size="lg"
              className="flex-1 gap-2 h-11"
            >
              Güvenli Ödemeye Geç
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

    </>
  );
}
