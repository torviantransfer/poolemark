"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";

/**
 * Renders nothing. Handles ?recover=<orderId> coming from WhatsApp recovery
 * links — restores items from the abandoned order back into the cart.
 *
 * Wrapped in <Suspense> by the page so useSearchParams() doesn't bail prerender.
 */
export default function CartRecoveryHandler() {
  const { items, mounted, loading, addItem } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const recoverId = searchParams.get("recover");
  const recoverHandledRef = useRef(false);

  useEffect(() => {
    if (!mounted || loading) return;
    if (!recoverId || recoverHandledRef.current) return;
    recoverHandledRef.current = true;

    (async () => {
      try {
        const res = await fetch(`/api/cart/recover/${recoverId}`);
        if (!res.ok) {
          toast.error("Sepet kurtarılamadı. Ürünler artık mevcut olmayabilir.");
          return;
        }
        const data = await res.json();
        const recoveredItems = (data.items || []) as Array<{
          product_id: string;
          variant_id: string | null;
          name: string;
          slug: string;
          image: string | null;
          price: number;
          compare_at_price: number | null;
          quantity: number;
          stock_quantity: number;
          variant_name: string | null;
        }>;

        if (recoveredItems.length === 0) {
          toast.error("Sepetinizdeki ürünler artık mevcut değil.");
          return;
        }

        let added = 0;
        for (const it of recoveredItems) {
          const exists = items.some(
            (cartItem) =>
              cartItem.product_id === it.product_id &&
              cartItem.variant_id === it.variant_id
          );
          if (exists) continue;
          if (it.stock_quantity <= 0) continue;
          addItem({
            product_id: it.product_id,
            variant_id: it.variant_id,
            name: it.name,
            image: it.image,
            price: it.price,
            compare_at_price: it.compare_at_price,
            quantity: Math.min(it.quantity, it.stock_quantity),
            stock_quantity: it.stock_quantity,
            slug: it.slug,
            variant_name: it.variant_name,
          });
          added++;
        }

        if (added > 0) {
          toast.success("Sepetiniz geri yüklendi. Ödemeye devam edebilirsiniz.");
        }
      } catch {
        toast.error("Sepet kurtarma sırasında bir hata oluştu.");
      } finally {
        router.replace("/sepet", { scroll: false });
      }
    })();
  }, [mounted, loading, recoverId, items, addItem, router]);

  return null;
}
