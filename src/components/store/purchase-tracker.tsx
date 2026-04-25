"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/meta-pixel";
import { trackSiteEvent } from "@/lib/site-events";

interface PurchaseTrackerProps {
  orderId: string;
  orderNumber: string;
  total: number;
  contentIds: string[];
  contents: { id: string; quantity: number; item_price: number }[];
  userEmail?: string | null;
  userPhone?: string | null;
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
}: PurchaseTrackerProps) {
  const fired = useRef(false);

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
        eventId: `purchase_${orderId}`,
        userEmail: userEmail ?? null,
        userPhone: userPhone ?? null,
      }
    );
    trackSiteEvent("purchase", {
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        value: total,
      },
    });

    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "1");
    }
  }, [orderId, orderNumber, total, contentIds, contents, userEmail, userPhone]);

  return null;
}
