"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/meta-pixel";
import { tiktokTrack } from "@/lib/tiktok-pixel";
import { trackSiteEvent } from "@/lib/site-events";
import { gaPurchase } from "@/lib/ga";
import { useCart } from "@/hooks/use-cart";
import { getPurchaseEventId } from "@/lib/meta-event-id";

interface PurchaseTrackerProps {
  orderId: string;
  orderNumber: string;
  total: number;
  contentIds: string[];
  contents: { id: string; quantity: number; item_price: number }[];
  userEmail?: string | null;
  userPhone?: string | null;
  externalId?: string | null;
}

/**
 * Fires the Meta `Purchase` event exactly once per order id (per browser),
 * mounted from the success page after PayTR redirects the user back.
 *
 * Uses sessionStorage to dedupe in case the user reloads the page.
 */
export function PurchaseTracker({
  orderId,
  orderNumber,
  total,
  contentIds,
  contents,
  userEmail,
  userPhone,
  externalId,
}: PurchaseTrackerProps) {
  const fired = useRef(false);
  const { clearCart } = useCart();

  useEffect(() => {
    if (fired.current) return;
    if (!orderId) return;

    const storageKey = `meta_purchase_${orderId}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey)) {
      return;
    }
    fired.current = true;

    trackEvent(
      "Purchase",
      {
        order_id: orderNumber,
        value: total,
        currency: "TRY",
        content_ids: contentIds,
        content_type: "product",
        contents,
        num_items: contents.reduce((s, c) => s + c.quantity, 0),
      },
      {
        eventId: getPurchaseEventId(orderId),
        userEmail: userEmail ?? null,
        userPhone: userPhone ?? null,
        externalId: externalId ?? null,
      }
    );
    trackSiteEvent("purchase", {
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        value: total,
      },
    });
    gaPurchase({
      transaction_id: orderNumber,
      value: total,
      items: contents.map((c) => ({
        item_id: c.id,
        price: c.item_price,
        quantity: c.quantity,
      })),
    });
    tiktokTrack("CompletePayment", {
      value: total,
      currency: "TRY",
      contents: contents.map((c) => ({
        content_id: c.id,
        content_type: "product",
        quantity: c.quantity,
        price: c.item_price,
      })),
      content_ids: contentIds,
      quantity: contents.reduce((s, c) => s + c.quantity, 0),
      order_id: orderNumber,
    });

    clearCart();

    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "1");
    }
  }, [orderId, orderNumber, total, contentIds, contents, userEmail, userPhone, clearCart]);

  return null;
}
