/**
 * Lightweight GA4 (gtag) event helpers.
 * Fail-silent — never affects UX. No-op if gtag isn't loaded.
 */

type GtagItem = {
  item_id: string;
  item_name?: string;
  price?: number;
  quantity?: number;
};

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  const fn = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
  if (typeof fn === "function") fn(...args);
}

export function gaAddToCart(params: {
  value: number;
  items: GtagItem[];
  currency?: string;
}) {
  gtag("event", "add_to_cart", {
    currency: params.currency || "TRY",
    value: params.value,
    items: params.items,
  });
}

export function gaBeginCheckout(params: {
  value: number;
  items: GtagItem[];
  currency?: string;
}) {
  gtag("event", "begin_checkout", {
    currency: params.currency || "TRY",
    value: params.value,
    items: params.items,
  });
}

export function gaViewItem(params: {
  value: number;
  items: GtagItem[];
  currency?: string;
}) {
  gtag("event", "view_item", {
    currency: params.currency || "TRY",
    value: params.value,
    items: params.items,
  });
}

export function gaPurchase(params: {
  transaction_id: string;
  value: number;
  items: GtagItem[];
  currency?: string;
  shipping?: number;
  tax?: number;
}) {
  gtag("event", "purchase", {
    transaction_id: params.transaction_id,
    currency: params.currency || "TRY",
    value: params.value,
    shipping: params.shipping ?? 0,
    tax: params.tax ?? 0,
    items: params.items,
  });
}

export function gaSearch(query: string) {
  gtag("event", "search", { search_term: query });
}

export function gaViewCart(params: { value: number; items: GtagItem[]; currency?: string }) {
  gtag("event", "view_cart", {
    currency: params.currency || "TRY",
    value: params.value,
    items: params.items,
  });
}

export function gaRemoveFromCart(params: { value: number; items: GtagItem[]; currency?: string }) {
  gtag("event", "remove_from_cart", {
    currency: params.currency || "TRY",
    value: params.value,
    items: params.items,
  });
}

export function gaAddToWishlist(params: { value?: number; items: GtagItem[]; currency?: string }) {
  gtag("event", "add_to_wishlist", {
    currency: params.currency || "TRY",
    value: params.value ?? 0,
    items: params.items,
  });
}

export function gaLogin(method: string = "email") {
  gtag("event", "login", { method });
}

export function gaSignUp(method: string = "email") {
  gtag("event", "sign_up", { method });
}

/** Sets the persistent GA user_id for cross-device attribution. Call on login. */
export function gaSetUserId(userId: string | null) {
  if (typeof window === "undefined") return;
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return;
  gtag("config", id, { user_id: userId || undefined });
}
