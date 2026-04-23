"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingBag, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  forcedImageUrl?: string | null;
}

export function ProductGallery({ images, productName, forcedImageUrl }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  // Varyant değiştiğinde ilk resme dön
  useEffect(() => {
    setActiveIndex(0);
  }, [forcedImageUrl]);

  // Varyant seçildiğinde o varyantın görselini öne al
  const displayImages = forcedImageUrl
    ? [
        { id: "forced", product_id: "", url: forcedImageUrl, alt_text: productName, sort_order: -1, is_primary: true },
        ...images.filter((img) => img.url !== forcedImageUrl),
      ]
    : images;

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-secondary/50 rounded-2xl flex items-center justify-center">
        <ShoppingBag className="h-20 w-20 text-muted-foreground/20" />
      </div>
    );
  }

  const activeImages = displayImages;

  function prev() {
    setActiveIndex((i) => (i === 0 ? activeImages.length - 1 : i - 1));
  }
  function next() {
    setActiveIndex((i) => (i === activeImages.length - 1 ? 0 : i + 1));
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div
          className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/30 group cursor-zoom-in"
          onClick={() => setLightbox(true)}
        >
          <Image
            src={activeImages[activeIndex]?.url || activeImages[0]?.url}
            alt={activeImages[activeIndex]?.alt_text || productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />

          {/* Zoom hint */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="h-4 w-4 text-foreground/70" />
          </div>

          {/* Image counter */}
          {activeImages.length > 1 && (
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
              {activeIndex + 1} / {activeImages.length}
            </div>
          )}

          {activeImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                aria-label="Önceki resim"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                aria-label="Sonraki resim"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {activeImages.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {activeImages.slice(0, 5).map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "relative aspect-square w-[72px] h-[72px] shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-150",
                  idx === activeIndex
                    ? "border-primary shadow-md scale-[1.04]"
                    : "border-border/50 hover:border-primary/50 hover:scale-[1.02] opacity-70 hover:opacity-100"
                )}
                aria-label={`Resim ${idx + 1}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt_text || `${productName} - ${idx + 1}`}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
                {idx === activeIndex && (
                  <div className="absolute inset-0 bg-primary/10" />
                )}
              </button>
            ))}
            {activeImages.length > 5 && (
              <button
                onClick={() => setActiveIndex(5)}
                className="relative w-[72px] h-[72px] shrink-0 rounded-xl border-2 border-border/50 overflow-hidden hover:border-primary/50 transition-all opacity-70 hover:opacity-100"
                aria-label={`+${activeImages.length - 5} daha`}
              >
                <Image
                  src={activeImages[5].url}
                  alt=""
                  fill
                  sizes="72px"
                  className="object-cover blur-[1px]"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+{activeImages.length - 5}</span>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={() => setLightbox(false)}
            aria-label="Kapat"
          >
            ✕
          </button>
          {activeImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Önceki"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Sonraki"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <div
            className="relative w-full max-w-3xl aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeImages[activeIndex]?.url || activeImages[0]?.url}
              alt={activeImages[activeIndex]?.alt_text || productName}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
