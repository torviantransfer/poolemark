/**
 * Facebook (Meta) Pixel + Conversions API helpers
 *
 * Client side: window.fbq("track", ...) standard events
 * Server side: POST to /api/meta-capi which forwards to
 *              https://graph.facebook.com/v19.0/{PIXEL_ID}/events
 *
 * Both client + server share the same `eventId` so Meta can deduplicate.
 */

import { getFbcFromCookie, getFbpFromCookie, getRawFbclidFromUrl } from "./meta-cookies";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export type StandardEvent =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "AddToCart"
  | "AddToWishlist"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Lead"
  | "CompleteRegistration"
  | "Contact";

export interface MetaContent {
  id: string;
  quantity?: number;
  item_price?: number;
}

export interface MetaEventParams {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_category?: string;
  content_type?: "product" | "product_group";
  contents?: MetaContent[];
  num_items?: number;
  search_string?: string;
  status?: boolean | string;
  order_id?: string;
}

/** Generate a unique event id (used for client + server dedup). */
export function generateEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Fire a standard Pixel event in the browser AND mirror it
 * to the server (Conversions API) for deduplicated tracking.
 */
export function trackEvent(
  event: StandardEvent,
  params: MetaEventParams = {},
  options: {
    eventId?: string;
    userEmail?: string | null;
    userPhone?: string | null;
    externalId?: string | null;
  } = {}
) {
  if (typeof window === "undefined") return;

  const eventId = options.eventId ?? generateEventId();

  // 1) Browser Pixel
  if (typeof window.fbq === "function") {
    window.fbq("track", event, params, { eventID: eventId });
  }

  // 2) Conversions API (server)
  void fetch("/api/meta-capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      event,
      eventId,
      event_id: eventId,
      eventSourceUrl: window.location.href,
      params,
      user: {
        email: options.userEmail ?? null,
        phone: options.userPhone ?? null,
        externalId: options.externalId ?? null,
        fbp: getFbpFromCookie(),
        fbc: getFbcFromCookie(),
        fbclidRaw: getRawFbclidFromUrl(),
      },
    }),
  }).catch(() => {
    // Fail silently — analytics must never break UX
  });
}
