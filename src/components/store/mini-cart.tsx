"use client";

import Link from "next/link";
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
  Trash2,
  ArrowRight,
  Truck,
} from "lucide-react";
import { formatPrice } from "@/lib/helpers";
import { useState } from "react";

export function MiniCart() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();
  const [open, setOpen] = useState(false);

  const FREE_SHIPPING_THRESHOLD = 500;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="relative p-2.5 text-foreground/70 hover:text-foreground transition-colors rounded-full hover:bg-secondary">
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold px-1">
            {itemCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="p-5 pb-4 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Sepetim
            {itemCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({itemCount} ürün)
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="font-medium text-foreground">Sepetiniz boş</p>
            <p className="text-sm text-muted-foreground mt-1">
              Hemen alışverişe başlayın!
            </p>
            <Button
              render={<Link href="/products" onClick={() => setOpen(false)} />}
              className="mt-5 gap-2"
              size="sm"
            >
              Ürünlere Göz At
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-secondary/30 rounded-xl p-3">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="w-16 h-16 rounded-lg bg-white overflow-hidden shrink-0"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground/20" />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="text-sm font-medium text-foreground line-clamp-1 hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm font-bold text-foreground mt-1">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-medium">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, Math.min(item.quantity + 1, item.stock_quantity))
                          }
                          disabled={item.quantity >= item.stock_quantity}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t p-4 space-y-3 bg-white">
              {/* Free Shipping Progress Bar */}
              {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-green-50 border border-green-100">
                  <Truck className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  <span className="text-xs font-semibold text-green-700">Ücretsiz kargo kazandınız!</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Ücretsiz kargoya</span>
                    <span className="text-xs font-semibold text-primary">{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} kaldı</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">500₺ ve üzeri siparişlerde kargo ücretsiz</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ara Toplam</span>
                <span className="text-lg font-bold text-foreground">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  render={<Link href="/sepet" onClick={() => setOpen(false)} />}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Sepete Git
                </Button>
                <Button
                  render={<Link href="/checkout" onClick={() => setOpen(false)} />}
                  size="sm"
                  className="w-full gap-1"
                >
                  Sipariş Ver
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
