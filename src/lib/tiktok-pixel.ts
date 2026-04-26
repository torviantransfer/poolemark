/**
 * Lightweight TikTok Pixel helpers.
 * Fail-silent — no-op when pixel script is not loaded.
 */

declare global {
  interface Window {
    ttq?: {
      track?: (event: string, params?: Record<string, unknown>) => void;
      page?: () => void;
    };
  }
}

export type TikTokEvent =
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "CompletePayment";

export function tiktokTrack(event: TikTokEvent, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const fn = window.ttq?.track;
  if (typeof fn === "function") {
    fn(event, params);
  }
}
