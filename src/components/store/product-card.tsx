"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Star, Check } from "lucide-react";
import { formatPrice, calculateDiscountPercentage } from "@/lib/helpers";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  className?: string;
  /** First few cards above the fold benefit from priority loading for LCP */
  priority?: boolean;
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.is_primary) ||
    product.images?.[0];
  const secondImage = product.images?.find(
    (img) => !img.is_primary && img.id !== primaryImage?.id
  );
  const discount = product.compare_at_price
    ? calculateDiscountPercentage(product.price, product.compare_at_price)
    : 0;
  const outOfStock = product.stock_quantity <= 0;
  // variants undefined = not fetched (redirect), empty array = no variants (add directly)
  const hasVariants = product.variants === undefined || (product.variants?.length ?? 0) > 0;

  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (hasVariants) {
      router.push(`/products/${product.slug}`);
      return;
    }
    addItem({
      product_id: product.id,
      variant_id: null,
      name: product.name,
      image: primaryImage?.url ?? null,
      price: product.price,
      compare_at_price: product.compare_at_price ?? null,
      quantity: 1,
      stock_quantity: product.stock_quantity,
      slug: product.slug,
      variant_name: null,
    });
    setAdded(true);
    toast.success("Sepete eklendi", {
      action: {
        label: "Sepete Git",
        onClick: () => router.push("/sepet"),
      },
    });
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div
      className={cn(
        "group relative bg-white rounded-2xl overflow-hidden border border-border/40 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-secondary/50"
      >
        {primaryImage ? (
          <>
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text || product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                "object-cover transition-all duration-500",
                secondImage
                  ? "group-hover:opacity-0 group-hover:scale-105"
                  : "group-hover:scale-105"
              )}
            />
            {secondImage && (
              <Image
                src={secondImage.url}
                alt={secondImage.alt_text || product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-0 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100"
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground/30">
            <ShoppingBag className="h-12 w-12" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-bold bg-destructive text-white rounded-md">
              %{discount}
            </span>
          )}
          {!outOfStock && product.stock_quantity <= (product.low_stock_threshold || 5) && (
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-warning text-white rounded-md">
              Son Birkaç
            </span>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-4 py-1.5 bg-white/90 text-foreground text-sm font-semibold rounded-lg">
              Tükendi
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.preventDefault();
              // TODO: toggle favorite
            }}
            aria-label="Favorilere ekle"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm text-foreground/70 hover:text-destructive hover:bg-white shadow-sm transition-all"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 md:p-4">
        {product.category && (
          <Link
            href={`/kategori/${product.category.slug}`}
            className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider hover:text-primary transition-colors"
          >
            {product.category.name}
          </Link>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-foreground mt-1 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.average_rating && product.average_rating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.round(product.average_rating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">
              ({product.review_count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">KDV Dahil</p>
        </div>

        {/* Sepete Ekle */}
        {!outOfStock && (
          <button
            onClick={handleAddToCart}
            className={cn(
              "mt-3 w-full h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200",
              added
                ? "bg-primary/15 text-primary"
                : "bg-primary text-white hover:bg-primary/90 active:scale-95"
            )}
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Eklendi
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                {hasVariants ? "Seçenek Seç" : "Sepete Ekle"}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border/40 shadow-sm">
      <div className="aspect-square bg-secondary animate-pulse" />
      <div className="p-3 md:p-4 space-y-2">
        <div className="h-2.5 bg-secondary rounded animate-pulse w-1/3" />
        <div className="h-3.5 bg-secondary rounded animate-pulse w-full" />
        <div className="h-3.5 bg-secondary rounded animate-pulse w-2/3" />
        <div className="h-5 bg-secondary rounded animate-pulse w-2/5 mt-1" />
      </div>
    </div>
  );
}
