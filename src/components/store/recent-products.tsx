"use client";

import Link from "next/link";
import Image from "next/image";
import { useRecentProducts } from "@/hooks/use-recent-products";
import { formatPrice, calculateDiscountPercentage } from "@/lib/helpers";
import { History } from "lucide-react";

interface RecentProductsProps {
  excludeId?: string;
  title?: string;
  className?: string;
}

export function RecentProducts({
  excludeId,
  title = "Son Gezdikleriniz",
  className = "",
}: RecentProductsProps) {
  const items = useRecentProducts(excludeId);

  if (items.length === 0) return null;

  return (
    <section className={`mt-16 pt-10 border-t border-border/30 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <History className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
      </div>

      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {items.map((p) => {
          const discount = p.compare_at_price
            ? calculateDiscountPercentage(p.price, p.compare_at_price)
            : 0;
          return (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="group shrink-0 w-[150px] md:w-[180px] rounded-2xl overflow-hidden border border-border/40 bg-white hover:shadow-md transition-all"
            >
              <div className="relative aspect-square bg-secondary/50 overflow-hidden">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="180px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : null}
                {discount > 0 && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold bg-destructive text-white rounded-md">
                    %{discount}
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors min-h-[32px]">
                  {p.name}
                </p>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-sm font-bold text-foreground">
                    {formatPrice(p.price)}
                  </span>
                  {p.compare_at_price && p.compare_at_price > p.price && (
                    <span className="text-[10px] text-muted-foreground line-through">
                      {formatPrice(p.compare_at_price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
