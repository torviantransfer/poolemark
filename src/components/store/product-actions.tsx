"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Lock, Minus, Plus, Shield, ShoppingBag, Share2, CreditCard, Zap } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Product } from "@/types";
import { SITE_CONFIG } from "@/constants";

interface ProductActionsProps {
  product: Product;
  disabled?: boolean;
}

export function ProductActions({ product, disabled }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem } = useCart();
  const { user } = useUser();
  const router = useRouter();

  const maxQty = Math.min(product.stock_quantity, 10);

  function handleAddToCart() {
    const image = product.images?.find((i) => i.is_primary)?.url || product.images?.[0]?.url || "";
    addItem({
      product_id: product.id,
      variant_id: null,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compare_at_price: product.compare_at_price ?? null,
      image,
      stock_quantity: product.stock_quantity,
      quantity,
      variant_name: null,
    });
    toast.success("Ürün sepete eklendi");
  }

  function handleBuyNow() {
    const image = product.images?.find((i) => i.is_primary)?.url || product.images?.[0]?.url || "";
    addItem({
      product_id: product.id,
      variant_id: null,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compare_at_price: product.compare_at_price ?? null,
      image,
      stock_quantity: product.stock_quantity,
      quantity,
      variant_name: null,
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
    <div className="mt-6 space-y-3">
      {/* Variant Selection */}
      {product.variants && product.variants.length > 0 && (
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Seçenekler
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:border-primary hover:text-primary transition-colors"
                disabled={variant.stock_quantity <= 0}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Row 1: Sepete Ekle (primary CTA) */}
      <Button
        onClick={handleAddToCart}
        disabled={disabled}
        size="lg"
        className="w-full h-13 text-[15px] font-bold gap-2.5 rounded-xl shadow-sm"
      >
        <ShoppingBag className="h-5 w-5" />
        {disabled ? "Tükendi" : "Sepete Ekle"}
      </Button>

      {/* Row 2: Qty + Hızlı Satın Al + WhatsApp */}
      {!disabled && (
        <div className="flex items-center gap-2">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between border border-border rounded-xl overflow-hidden bg-white shrink-0">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="h-11 w-9 inline-flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold tabular-nums">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty}
              className="h-11 w-9 inline-flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Hızlı Satın Al */}
          <Button
            onClick={handleBuyNow}
            variant="outline"
            className="h-11 flex-1 gap-1.5 rounded-xl border-primary/40 text-primary font-semibold hover:bg-primary/5 text-sm"
          >
            <Zap className="h-4 w-4 shrink-0" />
            Hızlı Satın Al
          </Button>

          {/* WhatsApp */}
          <Button
            onClick={handleWhatsApp}
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl border-green-500/40 text-green-700 hover:bg-green-50"
            title="WhatsApp&apos;tan Sor"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </Button>
        </div>
      )}

      {/* Row 3: Favori + Paylaş (secondary, subtle) */}
      <div className="flex items-center gap-3 pt-0.5">
        <button
          onClick={handleToggleFavorite}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            isFavorite ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-primary" : ""}`} />
          {isFavorite ? "Favorilerimde" : "Favorilere Ekle"}
        </button>
        <span className="text-border/60">·</span>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Paylaş
        </button>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 py-2.5 px-3 bg-gray-50 rounded-xl border border-border/40">
        <div className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-green-600 shrink-0" />
          <span className="text-[11px] font-semibold text-green-700">256-Bit SSL</span>
        </div>
        <span className="text-border/60 text-xs hidden sm:inline">|</span>
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span className="text-[11px] font-semibold text-gray-700">PayTR Güvenli Ödeme</span>
        </div>
        <span className="text-border/60 text-xs hidden sm:inline">|</span>
        <div className="flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5 text-gray-500 shrink-0" />
          <span className="text-[11px] font-semibold text-gray-700">Tüm Kartlar</span>
        </div>
      </div>
    </div>
  );
}
