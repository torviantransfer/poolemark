"use client";

import { useState } from "react";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductActions } from "@/components/store/product-actions";
import { ShippingTimeline } from "@/components/store/shipping-timeline";
import type { Product, ProductImage } from "@/types";

interface ProductDetailClientProps {
  product: Product;
  images: ProductImage[];
  disabled: boolean;
  children: React.ReactNode; // fiyat, stok, kargo vb. statik kısımlar
}

export function ProductDetailClient({ product, images, disabled, children }: ProductDetailClientProps) {
  const [variantImageUrl, setVariantImageUrl] = useState<string | null>(null);

  return (
    <div className="grid lg:grid-cols-2 gap-10 md:gap-16">
      {/* Gallery + (desktop) Shipping Timeline */}
      <div className="space-y-6">
        <ProductGallery
          images={images}
          productName={product.name}
          forcedImageUrl={variantImageUrl}
        />
        {/* Desktop only: kargo zaman çizelgesi galerinin altında */}
        <div className="hidden lg:block">
          <ShippingTimeline />
        </div>
      </div>

      {/* Info */}
      <div>
        {children}
        <ProductActions
          product={product}
          disabled={disabled}
          onVariantImageChange={setVariantImageUrl}
        />
        {/* Mobile only: kargo zaman çizelgesi info bölümünün altında */}
        <div className="lg:hidden mt-6">
          <ShippingTimeline />
        </div>
      </div>
    </div>
  );
}
