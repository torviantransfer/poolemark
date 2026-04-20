"use client";

import { useState } from "react";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductActions } from "@/components/store/product-actions";
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
      {/* Gallery */}
      <ProductGallery
        images={images}
        productName={product.name}
        forcedImageUrl={variantImageUrl}
      />

      {/* Info */}
      <div>
        {children}
        <ProductActions
          product={product}
          disabled={disabled}
          onVariantImageChange={setVariantImageUrl}
        />
      </div>
    </div>
  );
}
