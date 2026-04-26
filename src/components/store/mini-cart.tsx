"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ShoppingBag,
  Minus,
  Plus,
  X,
  ArrowRight,
  Truck,
} from "lucide-react";
import { formatPrice } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { gaRemoveFromCart } from "@/lib/ga";

export function MiniCart({ transparent = false }: { transparent?: boolean }) {
  const { items, itemCount, subtotal, updateQuantity, removeItem, mounted } = useCart();
  const [open, setOpen] = useState(false);

  const FREE_SHIPPING_THRESHOLD = 500;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  if (!mounted) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Sepeti aç"
        className={cn(
          "relative p-2.5 transition-colors rounded-full",
          transparent
            ? "text-white/75 hover:text-white hover:bg-white/10"
            : "text-foreground/70 hover:text-foreground hover:bg-secondary"
        )}
      >
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold px-1">
            {itemCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col gap-0">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-0 shrink-0">
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-base font-semibold">
              Sepetim
              {itemCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold">
                  {itemCount}
                </span>
              )}
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* Kargo progress bar — header'a yapışık */}
        {items.length > 0 && (
          <div className="px-5 pt-3 pb-4 shrink-0">
            {subtotal >= FREE_SHIPPING_THRESHOLD ? (
              <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-green-50 border border-green-100">
                <Truck className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <span className="text-xs font-semibold text-green-700">Ücretsiz kargo kazandınız! 🎉</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Ücretsiz kargoya</span>
                  <span className="text-xs font-semibold text-primary">{formatPrice(remaining)} kaldı</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-full transition-all duration-500"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        {items.length > 0 && <div className="h-px bg-border shrink-0" />}

        {/* Boş sepet */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-5">
              <ShoppingBag className="h-9 w-9 text-muted-foreground/40" />
            </div>
            <p className="text-base font-semibold text-foreground">Sepetiniz boş</p>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              Beğeneceğin ürünler seni bekliyor!
            </p>
            <Button
              render={<Link href="/products" onClick={() => setOpen(false)} />}
              className="mt-6 gap-2 px-6"
            >
              Alışverişe Başla
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            {/* Ürünler */}
            <div className="flex-1 overflow-y-auto py-3 px-4 space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-white border rounded-2xl p-3 shadow-sm">
                  {/* Resim */}
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="w-[72px] h-[72px] rounded-xl bg-secondary overflow-hidden shrink-0"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={72}
                        height={72}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-muted-foreground/20" />
                      </div>
                    )}
                  </Link>

                  {/* Bilgiler */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() => setOpen(false)}
                          className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {item.variant_name && (
                            <span className="text-xs text-muted-foreground">{item.variant_name}</span>
                          )}
                          {item.unit_label && (() => {
                            const match = item.unit_label.match(/^(\d+)\s*(.+)$/);
                            const label = match
                              ? `${parseInt(match[1]) * item.quantity} ${match[2]}`
                              : item.unit_label;
                            return (
                              <span className="inline-flex items-center text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                                {label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                      {/* Sil */}
                      <button
                        onClick={() => {
                          gaRemoveFromCart({
                            value: item.price * item.quantity,
                            items: [{
                              item_id: item.variant_id ?? item.product_id,
                              item_name: item.name,
                              price: item.price,
                              quantity: item.quantity,
                            }],
                          });
                          removeItem(item.id);
                        }}
                        className="p-1 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-red-50 transition-colors shrink-0"
                        aria-label="Ürünü kaldır"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Miktar */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                          aria-label="Azalt"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-semibold min-w-[24px] text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, Math.min(item.quantity + 1, item.stock_quantity))
                          }
                          disabled={item.quantity >= item.stock_quantity}
                          className="w-7 h-7 rounded-lg border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 disabled:opacity-30 transition-colors"
                          aria-label="Artır"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Fiyat */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-muted-foreground tabular-nums">
                            {formatPrice(item.price)} / {item.unit_label ? "paket" : "adet"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t bg-white px-4 pt-4 pb-5 space-y-3">
              {/* Toplam */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ara Toplam</span>
                <span className="text-xl font-bold text-foreground tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {/* Ödemeye geç — ana CTA */}
              <Button
                render={<Link href="/checkout" onClick={() => setOpen(false)} />}
                className="w-full h-12 text-base gap-2 rounded-xl"
              >
                Ödemeye Geç
                <ArrowRight className="h-4 w-4" />
              </Button>

              {/* Sepeti gör — ikincil */}
              <div className="text-center">
                <Link
                  href="/sepet"
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                >
                  Sepeti Düzenle
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
