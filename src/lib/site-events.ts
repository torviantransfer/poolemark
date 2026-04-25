/**
 * Lightweight client-side funnel tracking. Fires events to /api/track.
 * Fail-silent — must never affect UX.
 */

const SESSION_KEY = "pm_sid";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = window.localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid =
        (crypto.randomUUID && crypto.randomUUID()) ||
        Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "anon";
  }
}

export type SiteEventType =
  | "page_view"
  | "add_to_cart"
  | "initiate_checkout"
  | "purchase";

export function trackSiteEvent(
  event_type: SiteEventType,
  options: {
    path?: string;
    userId?: string | null;
    metadata?: Record<string, unknown>;
  } = {}
): void {
  if (typeof window === "undefined") return;
  const session_id = getSessionId();
  const payload = {
    event_type,
    session_id,
    user_id: options.userId ?? null,
    path: options.path ?? window.location.pathname,
    metadata: options.metadata ?? null,
  };
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    // Silent fail
  }
}
