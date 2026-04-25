"use client";

import { useEffect, useState } from "react";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductActions } from "@/components/store/product-actions";
import { ShippingTimeline } from "@/components/store/shipping-timeline";
import { trackEvent } from "@/lib/meta-pixel";
import { gaViewItem } from "@/lib/ga";
import type { Product, ProductImage } from "@/types";

interface ProductDetailClientProps {
  product: Product;
  images: ProductImage[];
  disabled: boolean;
  children: React.ReactNode; // fiyat, stok, kargo vb. statik kısımlar
}

export function ProductDetailClient({ product, images, disabled, children }: ProductDetailClientProps) {
  const [variantImageUrl, setVariantImageUrl] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("ViewContent", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      contents: [{ id: product.id, quantity: 1, item_price: product.price }],
      value: product.price,
      currency: "TRY",
    });
    gaViewItem({
      value: product.price,
      items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: 1 }],
    });
  }, [product.id, product.name, product.price]);

  return (
    <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-16 min-w-0">
      {/* Gallery + (desktop) Shipping Timeline */}
      <div className="space-y-6 min-w-0">
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
      <div className="min-w-0">
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
