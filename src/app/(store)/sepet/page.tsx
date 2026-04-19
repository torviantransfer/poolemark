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
} from "lucide-react";
import { formatPrice } from "@/lib/helpers";
import { useState } from "react";

export default function CartPage() {
  const { items, loading, itemCount, subtotal, updateQuantity, removeItem } =
    useCart();
  const [couponCode, setCouponCode] = useState("");

  const FREE_SHIPPING_THRESHOLD = 500;
  const SHIPPING_COST = 39.9;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

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
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
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
                        <img
                          src={item.image}
                          alt={item.name}
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
                <div className="bg-secondary/40 rounded-2xl p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-foreground mb-5">
                    Sipariş Özeti
                  </h3>

                  {/* Coupon */}
                  <div className="flex gap-2 mb-5">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Kupon kodu"
                        className="pl-9"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      Uygula
                    </Button>
                  </div>

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
                    {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                      <p className="text-xs text-primary">
                        {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} daha
                        ekleyin, kargo bedava!
                      </p>
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
                    render={<Link href="/checkout" />}
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
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
