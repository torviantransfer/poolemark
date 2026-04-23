"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, Minus, Plus, ShoppingBag, Share2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Product } from "@/types";
import { SITE_CONFIG } from "@/constants";
import { StockNotifyForm } from "@/components/store/stock-notify-form";

interface ProductActionsProps {
  product: Product;
  disabled?: boolean;
  onVariantImageChange?: (imageUrl: string | null) => void;
}

function formatVariantName(name: string): string {
  return name
    .replace(/-/g, " ")
    .replace(/\b\d+$/, "")
    .trim()
    .replace(/\b\w/g, (c) => c.toLocaleUpperCase("tr"));
}

export function ProductActions({ product, disabled, onVariantImageChange }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] ?? null
  );
  const { addItem } = useCart();
  const { user } = useUser();
  const router = useRouter();

  // Kullanıcının bu ürünü favorilerinde olup olmadığını kontrol et
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsFavorite(!!data);
      });
  }, [user, product.id]);

  const activeVariant = selectedVariant;
  const currentPrice = activeVariant ? activeVariant.price : product.price;
  const currentStock = activeVariant ? activeVariant.stock_quantity : product.stock_quantity;
  const maxQty = Math.min(currentStock, 10);
  const isOutOfStock = disabled || currentStock <= 0;

  function handleAddToCart() {
    const image = product.images?.find((i) => i.is_primary)?.url || product.images?.[0]?.url || "";
    addItem({
      product_id: product.id,
      variant_id: activeVariant?.id ?? null,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      compare_at_price: product.compare_at_price ?? null,
      image,
      stock_quantity: currentStock,
      quantity,
      variant_name: activeVariant?.name ?? null,
    });
    toast.success("Ürün sepete eklendi", {
      action: {
        label: "Sepete Git",
        onClick: () => router.push("/sepet"),
      },
    });
  }

  function handleBuyNow() {
    const image = product.images?.find((i) => i.is_primary)?.url || product.images?.[0]?.url || "";
    addItem({
      product_id: product.id,
      variant_id: activeVariant?.id ?? null,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      compare_at_price: product.compare_at_price ?? null,
      image,
      stock_quantity: currentStock,
      quantity,
      variant_name: activeVariant?.name ?? null,
    });
    router.push("/checkout");
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(
      `Merhaba, "${product.name}" ürünü hakkında bilgi almak istiyorum.\n${window.location.href}`
    );
    window.open(`https://wa.me/${SITE_CONFIG.whatsapp}?text=${text}`, "_blank");
  }

  async function handleToggleFavorite() {
    if (!user) {
      toast.error("Favorilere eklemek için giriş yapmalısınız");
      return;
    }
    const supabase = createClient();
    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", product.id);
      setIsFavorite(false);
      toast.success("Favorilerden çıkarıldı");
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: user.id, product_id: product.id });
      setIsFavorite(true);
      toast.success("Favorilere eklendi");
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <div className="mt-6 space-y-5">

      {/* ── Renk Seçimi ─────────────────────────────────────── */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Renk:</span>
            <span className="text-sm font-semibold text-foreground">
              {activeVariant ? formatVariantName(activeVariant.name) : ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {product.variants.map((variant) => {
              const isSelected = activeVariant?.id === variant.id;
              const outOfStock = variant.stock_quantity <= 0;
              return (
                <button
                  key={variant.id}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setQuantity(1);
                    onVariantImageChange?.(variant.image_url ?? null);
                  }}
                  disabled={outOfStock}
                  title={formatVariantName(variant.name)}
                  className={cn(
                    "relative w-12 h-12 rounded-full overflow-hidden transition-all duration-150 shrink-0 focus:outline-none",
                    isSelected
                      ? "ring-[3px] ring-primary ring-offset-2 scale-105"
                      : outOfStock
                      ? "opacity-35 cursor-not-allowed"
                      : "ring-1 ring-border/50 hover:ring-2 hover:ring-primary/50 hover:scale-105"
                  )}
                >
                  {variant.image_url ? (
                    <Image
                      src={variant.image_url}
                      alt={variant.name}
                      fill
                      sizes="48px"
                      className={cn("object-cover", outOfStock && "grayscale")}
                    />
                  ) : (
                    <div className={cn(
                      "w-full h-full flex items-center justify-center text-[9px] font-bold bg-secondary text-foreground/70",
                      isSelected && "bg-primary/15 text-primary"
                    )}>
                      {variant.name.slice(0, 4)}
                    </div>
                  )}
                  {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-9 h-px bg-destructive/70 rotate-45" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Adet + Sepete Ekle ──────────────────────────────── */}
      <div className="flex gap-2">
        {/* Adet */}
        <div className="flex items-center border border-border rounded-xl overflow-hidden bg-background shrink-0 h-12">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="h-full w-10 inline-flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-9 text-center text-sm font-bold tabular-nums">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            disabled={quantity >= maxQty}
            className="h-full w-10 inline-flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Sepete Ekle */}
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="flex-1 h-12 text-[15px] font-bold gap-2 rounded-xl"
        >
          <ShoppingBag className="h-5 w-5" />
          {isOutOfStock ? "Stok Yok" : "Sepete Ekle"}
        </Button>
      </div>
      {/* ── Stoğa girince haber ver (sadece tükendiğinde) ── */}
      {isOutOfStock && (
        <StockNotifyForm
          productId={product.id}
          variantId={activeVariant?.id ?? null}
        />
      )}
      {/* ── Hızlı Satın Al ──────────────────────────────────── */}
      {!isOutOfStock && (
        <Button
          onClick={handleBuyNow}
          variant="outline"
          className="w-full h-11 gap-2 rounded-xl border-primary/30 text-primary font-semibold hover:bg-primary/5 text-sm"
        >
          <Zap className="h-4 w-4 shrink-0" />
          Hemen Satın Al
        </Button>
      )}

      {/* ── Favori + Paylaş + WhatsApp ───────────────────────── */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleToggleFavorite}
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors",
            isFavorite
              ? "bg-primary/8 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-primary text-primary")} />
          {isFavorite ? "Favorilerimde" : "Favorilere Ekle"}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Paylaş
        </button>
        <div className="ml-auto">
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg text-green-700 hover:bg-green-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </button>
        </div>
      </div>

      {/* ── Ödeme Logoları ─────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/payment-methods/kart-odeme.svg"
          alt="Kart ile güvenli ödeme"
          className="w-full h-auto object-contain"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/payment-methods/footer-bilgi.png"
          alt="Güvenli ödeme yöntemleri"
          className="w-full h-auto object-contain"
        />
      </div>


    </div>
  );
}
