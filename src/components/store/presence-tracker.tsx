"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { useCart } from "@/hooks/use-cart";
import { isReturningVisitor, trackSiteLeave } from "@/lib/site-events";

// Sayfa path'inden funnel aşaması türet — admin paneli "Sıcak Kişiler" hesabında kullanır.
function deriveFunnelStage(path: string | null | undefined): "browsing" | "product" | "cart" | "checkout" | "payment" | "thankyou" {
  const p = path || "/";
  if (p.startsWith("/odeme-sonucu")) return "thankyou";
  if (p.startsWith("/checkout")) return "checkout";
  if (p.startsWith("/sepet")) return "cart";
  if (p.startsWith("/products/")) return "product";
  return "browsing";
}

function getSessionId() {
  const key = "poolemark_presence_session_id";
  const current = sessionStorage.getItem(key);
  if (current) return current;
  const generated = crypto.randomUUID();
  sessionStorage.setItem(key, generated);
  return generated;
}

async function getGeoInfo(): Promise<{ city: string; country: string; region: string }> {
  const cacheKey = "poolemark_geo";
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch { /* ignore */ }
  }
  try {
    const res = await fetch("/api/geo");
    const data = await res.json();
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch {
    return { city: "", country: "", region: "" };
  }
}

type Attribution = {
  source: string;
  medium: string;
  campaign: string;
  referrerHost: string;
};

function detectAttribution(): Attribution {
  const cacheKey = "poolemark_attribution";
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as Attribution;
    } catch {
      // ignore broken cache
    }
  }

  const params = new URLSearchParams(window.location.search);
  const utmSource = (params.get("utm_source") || "").trim().toLowerCase();
  const utmMedium = (params.get("utm_medium") || "").trim().toLowerCase();
  const utmCampaign = (params.get("utm_campaign") || "").trim();

  const gclid = params.get("gclid");
  const fbclid = params.get("fbclid");

  const referrer = document.referrer || "";
  let referrerHost = "";
  try {
    referrerHost = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : "";
  } catch {
    referrerHost = "";
  }

  let source = utmSource;
  let medium = utmMedium;

  if (!source) {
    if (gclid) {
      source = "google";
      medium = medium || "cpc";
    } else if (fbclid) {
      source = "facebook";
      medium = medium || "paid_social";
    } else if (referrerHost.includes("instagram")) {
      source = "instagram";
      medium = medium || "referral";
    } else if (referrerHost.includes("facebook")) {
      source = "facebook";
      medium = medium || "referral";
    } else if (referrerHost.includes("google.")) {
      source = "google";
      medium = medium || "organic";
    } else if (referrerHost) {
      source = referrerHost;
      medium = medium || "referral";
    } else {
      source = "direct";
      medium = medium || "none";
    }
  }

  const attribution: Attribution = {
    source: source || "direct",
    medium: medium || "none",
    campaign: utmCampaign,
    referrerHost,
  };

  sessionStorage.setItem(cacheKey, JSON.stringify(attribution));
  return attribution;
}

export function PresenceTracker() {
  const pathname = usePathname();
  const { user } = useUser();
  const { itemCount, subtotal } = useCart();
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const geoRef = useRef<{ city: string; country: string; region: string } | null>(null);
  const attributionRef = useRef<Attribution | null>(null);
  const statusRef = useRef<string>("CLOSED");
  const pathnameRef = useRef(pathname);
  const userIdRef = useRef<string | null>(user?.id || null);
  const lastActionRef = useRef<string>("");
  const cartCountRef = useRef<number>(itemCount);
  const cartValueRef = useRef<number>(subtotal);
  // Gerçek "siteye geliş zamanı" — her track'te değişmesin diye sabit tut.
  const firstSeenAtRef = useRef<string>(new Date().toISOString());

  // Keep refs in sync so async callbacks always read the latest values.
  useEffect(() => {
    pathnameRef.current = pathname;
    userIdRef.current = user?.id || null;
    cartCountRef.current = itemCount;
    cartValueRef.current = subtotal;
  }, [pathname, user?.id, itemCount, subtotal]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_PRESENCE !== "true") return;

    let cancelled = false;
    const supabase = createClient();
    supabaseRef.current = supabase;
    const key = getSessionId();

    const buildPayload = (action?: string) => ({
      role: "store-visitor",
      path: pathnameRef.current,
      userId: userIdRef.current,
      joinedAt: firstSeenAtRef.current,
      isReturning: isReturningVisitor(),
      city: geoRef.current?.city ?? "",
      country: geoRef.current?.country ?? "",
      source: attributionRef.current?.source ?? "direct",
      medium: attributionRef.current?.medium ?? "none",
      campaign: attributionRef.current?.campaign ?? "",
      referrerHost: attributionRef.current?.referrerHost ?? "",
      lastAction: action || lastActionRef.current || `Sayfa: ${pathnameRef.current}`,
      cartCount: cartCountRef.current,
      cartValue: cartValueRef.current,
      stage: deriveFunnelStage(pathnameRef.current),
    });

    const setupChannel = () => {
      if (cancelled) return;
      // Tear down any previous channel before opening a new one.
      const prev = channelRef.current;
      if (prev) {
        try {
          prev.unsubscribe();
          supabase.removeChannel(prev);
        } catch {
          // ignore
        }
        channelRef.current = null;
      }

      const channel = supabase.channel("online-visitors", {
        config: { presence: { key } },
      });
      channelRef.current = channel;

      channel.subscribe(async (status) => {
        statusRef.current = status;
        if (status === "SUBSCRIBED") {
          if (!geoRef.current) {
            try {
              geoRef.current = await getGeoInfo();
            } catch {
              geoRef.current = { city: "", country: "", region: "" };
            }
          }
          if (!attributionRef.current) {
            attributionRef.current = detectAttribution();
          }
          if (!cancelled) {
            await channel.track(buildPayload());
          }
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          // Auto-reconnect with backoff (only if document is visible).
          if (!cancelled && document.visibilityState === "visible") {
            window.setTimeout(() => setupChannel(), 1500);
          }
        }
      });
    };

    setupChannel();

    // Pathname change updates lastAction so subsequent re-tracks reflect it.
    const trackPath = () => {
      lastActionRef.current = `Sayfa: ${pathnameRef.current}`;
      const channel = channelRef.current;
      if (channel && statusRef.current === "SUBSCRIBED") {
        channel.track(buildPayload());
      }
    };

    const reTrack = () => {
      const channel = channelRef.current;
      if (!channel) {
        setupChannel();
        return;
      }
      if (statusRef.current !== "SUBSCRIBED") {
        setupChannel();
        return;
      }
      channel.track(buildPayload());
    };

    // Click tracker — captures any <a>/<button> click on the document.
    // İkon-only butonlarda textContent boş geliyor; aria-label/title/data-track fallback'leri
    // sayesinde "Tiklama: Buton" gibi anlamsız etiketler yerine gerçek anlamlı isimler ç​ı​kar.
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const clickable = target.closest("a,button") as HTMLAnchorElement | HTMLButtonElement | null;
      if (!clickable) return;

      const dataTrack = clickable.getAttribute("data-track") || "";
      const ariaLabel = clickable.getAttribute("aria-label") || "";
      const title = clickable.getAttribute("title") || "";
      const text = (clickable.textContent || "").replace(/\s+/g, " ").trim();
      const href = clickable instanceof HTMLAnchorElement ? clickable.getAttribute("href") || "" : "";

      // Öncelik sırası: data-track > aria-label > title > inner text > href.
      let label = (dataTrack || ariaLabel || title || text || href).slice(0, 60);
      if (!label) {
        // Hiç anlamlı bilgi yoksa bu tıklamayı admin paneline bildirme — gürültü yapar.
        return;
      }
      lastActionRef.current =
        clickable.tagName === "A" ? `Link: ${label}` : `Tıklama: ${label}`;

      const channel = channelRef.current;
      if (channel && statusRef.current === "SUBSCRIBED") {
        channel.track(buildPayload());
      }
    };
    document.addEventListener("click", onClick);

    // Heartbeat: keep presence alive, recover from idle / network disconnects.
    const interval = window.setInterval(reTrack, 15000);

    const onVisible = () => {
      if (document.visibilityState === "visible") reTrack();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", reTrack);
    window.addEventListener("online", reTrack);

    // Site terk: pagehide (iOS dahil) sayfa boşaltılırken sendBeacon ile log atar.
    let leaveSent = false;
    const onLeave = () => {
      if (leaveSent) return;
      leaveSent = true;
      trackSiteLeave({
        lastPath: pathnameRef.current,
        lastAction: lastActionRef.current,
        userId: userIdRef.current,
      });
    };
    window.addEventListener("pagehide", onLeave);
    window.addEventListener("beforeunload", onLeave);

    // Trigger initial trackPath so /checkout etc. is reflected immediately.
    trackPath();

    // Expose imperative helper for components that need to push a custom action.
    const w = window as unknown as { pmPresenceUpdate?: (label: string) => void };
    w.pmPresenceUpdate = (label: string) => {
      lastActionRef.current = label.slice(0, 80);
      reTrack();
    };

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", reTrack);
      window.removeEventListener("online", reTrack);
      window.removeEventListener("pagehide", onLeave);
      window.removeEventListener("beforeunload", onLeave);
      delete w.pmPresenceUpdate;
      const ch = channelRef.current;
      if (ch) {
        try {
          ch.untrack();
          ch.unsubscribe();
          supabase.removeChannel(ch);
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // On pathname / user / cart change, push an updated presence (if connected).
  useEffect(() => {
    lastActionRef.current = `Sayfa: ${pathname}`;
    const channel = channelRef.current;
    if (channel && statusRef.current === "SUBSCRIBED") {
      channel.track({
        role: "store-visitor",
        path: pathname,
        userId: user?.id || null,
        joinedAt: firstSeenAtRef.current,
        isReturning: isReturningVisitor(),
        city: geoRef.current?.city ?? "",
        country: geoRef.current?.country ?? "",
        source: attributionRef.current?.source ?? "direct",
        medium: attributionRef.current?.medium ?? "none",
        campaign: attributionRef.current?.campaign ?? "",
        referrerHost: attributionRef.current?.referrerHost ?? "",
        lastAction: `Sayfa: ${pathname}`,
        cartCount: itemCount,
        cartValue: subtotal,
        stage: deriveFunnelStage(pathname),
      });
    }
  }, [pathname, user?.id, itemCount, subtotal]);

  return null;
}
