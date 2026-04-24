import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, calculateDiscountPercentage } from "@/lib/helpers";
import { cn } from "@/lib/utils";

interface HomeProductCardProps {
  product: Product;
}

export function HomeProductCard({ product }: HomeProductCardProps) {
  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
  const discount = product.compare_at_price
    ? calculateDiscountPercentage(product.price, product.compare_at_price)
    : 0;
  const outOfStock = product.stock_quantity <= 0;

  return (
    <article className="group relative bg-white rounded-2xl overflow-hidden border border-border/40 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-secondary/50"
      >
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt_text || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground/30">
            <ShoppingBag className="h-12 w-12" aria-hidden="true" />
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-bold bg-destructive text-white rounded-md">
              %{discount}
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
      </Link>

      <div className="p-3 md:p-4">
        {product.category ? (
          <Link
            href={`/kategori/${product.category.slug}`}
            className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider hover:text-primary transition-colors"
          >
            {product.category.name}
          </Link>
        ) : null}

        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-foreground mt-1 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.average_rating && product.average_rating > 0 ? (
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
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">({product.review_count})</span>
          </div>
        ) : null}

        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-foreground">{formatPrice(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            ) : null}
          </div>
          <p className="text-[10px] text-muted-foreground">KDV Dahil</p>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="mt-3 w-full h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
          Ürünü Gör
        </Link>
      </div>
    </article>
  );
}
