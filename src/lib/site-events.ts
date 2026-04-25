/**
 * Lightweight client-side funnel tracking. Fires events to /api/track.
 * Fail-silent — must never affect UX.
 */

const SESSION_KEY = "pm_sid";
const FIRST_VISIT_KEY = "pm_first_visit";

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

/**
 * Returns true when the visitor has been seen on a previous calendar day.
 * Side-effect: stores today's date as first-visit if not already present.
 */
export function isReturningVisitor(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const stored = window.localStorage.getItem(FIRST_VISIT_KEY);
    if (!stored) {
      window.localStorage.setItem(FIRST_VISIT_KEY, today);
      return false;
    }
    return stored < today;
  } catch {
    return false;
  }
}

const ATTRIBUTION_KEY = "poolemark_attribution";

function detectSource(): { source: string; medium: string } {
  if (typeof window === "undefined") return { source: "direct", medium: "none" };
  try {
    const cached = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as { source?: string; medium?: string };
      if (parsed.source) return { source: parsed.source, medium: parsed.medium || "none" };
    }
  } catch {
    // ignore parse errors
  }
  // Fallback inline detection if presence tracker hasn't run yet.
  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = (params.get("utm_source") || "").trim().toLowerCase();
    const utmMedium = (params.get("utm_medium") || "").trim().toLowerCase();
    const fbclid = params.get("fbclid");
    const gclid = params.get("gclid");
    const ref = document.referrer || "";
    let host = "";
    try {
      host = ref ? new URL(ref).hostname.replace(/^www\./, "") : "";
    } catch {
      host = "";
    }
    if (utmSource) return { source: utmSource, medium: utmMedium || "none" };
    if (gclid) return { source: "google", medium: "cpc" };
    if (fbclid) return { source: "facebook", medium: "paid_social" };
    if (host.includes("instagram")) return { source: "instagram", medium: "referral" };
    if (host.includes("facebook")) return { source: "facebook", medium: "referral" };
    if (host.includes("google.")) return { source: "google", medium: "organic" };
    if (host) return { source: host, medium: "referral" };
    return { source: "direct", medium: "none" };
  } catch {
    return { source: "direct", medium: "none" };
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
  const is_returning = isReturningVisitor();
  const { source, medium } = detectSource();
  const payload = {
    event_type,
    session_id,
    user_id: options.userId ?? null,
    path: options.path ?? window.location.pathname,
    metadata: {
      is_returning,
      source,
      medium,
      ...(options.metadata ?? {}),
    },
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
