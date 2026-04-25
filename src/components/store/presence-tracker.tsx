"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";

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
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const geoRef = useRef<{ city: string; country: string; region: string } | null>(null);
  const attributionRef = useRef<Attribution | null>(null);

  useEffect(() => {
    // Realtime presence tracking is opt-in via env flag to avoid
    // unnecessary WebSocket connections (and console errors when
    // Realtime is disabled on the Supabase project).
    if (process.env.NEXT_PUBLIC_ENABLE_PRESENCE !== "true") {
      return;
    }

    const supabase = createClient();
    const key = getSessionId();
    const channel = supabase.channel("online-visitors", {
      config: { presence: { key } },
    });

    channelRef.current = channel;

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        if (!geoRef.current) {
          geoRef.current = await getGeoInfo();
        }
        if (!attributionRef.current) {
          attributionRef.current = detectAttribution();
        }
        await channel.track({
          role: "store-visitor",
          path: pathname,
          userId: user?.id || null,
          joinedAt: new Date().toISOString(),
          city: geoRef.current.city,
          country: geoRef.current.country,
          source: attributionRef.current.source,
          medium: attributionRef.current.medium,
          campaign: attributionRef.current.campaign,
          referrerHost: attributionRef.current.referrerHost,
          lastAction: `Sayfa: ${pathname}`,
        });
      }
    });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const channel = channelRef.current;
    if (!channel) return;

    channel.track({
      role: "store-visitor",
      path: pathname,
      userId: user?.id || null,
      joinedAt: new Date().toISOString(),
      city: geoRef.current?.city ?? "",
      country: geoRef.current?.country ?? "",
      source: attributionRef.current?.source ?? "direct",
      medium: attributionRef.current?.medium ?? "none",
      campaign: attributionRef.current?.campaign ?? "",
      referrerHost: attributionRef.current?.referrerHost ?? "",
      lastAction: `Sayfa: ${pathname}`,
    });
  }, [pathname, user?.id]);

  useEffect(() => {
    const channel = channelRef.current;
    if (!channel) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest("a,button") as HTMLAnchorElement | HTMLButtonElement | null;
      if (!clickable) return;

      const text = (clickable.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);
      const href = clickable instanceof HTMLAnchorElement ? clickable.getAttribute("href") || "" : "";
      const label = text || href || (clickable.tagName === "A" ? "Link" : "Buton");

      channel.track({
        role: "store-visitor",
        path: pathname,
        userId: user?.id || null,
        joinedAt: new Date().toISOString(),
        city: geoRef.current?.city ?? "",
        country: geoRef.current?.country ?? "",
        source: attributionRef.current?.source ?? "direct",
        medium: attributionRef.current?.medium ?? "none",
        campaign: attributionRef.current?.campaign ?? "",
        referrerHost: attributionRef.current?.referrerHost ?? "",
        lastAction: `Tiklama: ${label}`,
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname, user?.id]);

  // Heartbeat: re-track every 25s and on visibility/online events so that
  // Realtime presence does not drop the visitor due to idle/tab throttling.
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_PRESENCE !== "true") return;

    const reTrack = () => {
      const channel = channelRef.current;
      if (!channel) return;
      channel.track({
        role: "store-visitor",
        path: pathname,
        userId: user?.id || null,
        joinedAt: new Date().toISOString(),
        city: geoRef.current?.city ?? "",
        country: geoRef.current?.country ?? "",
        source: attributionRef.current?.source ?? "direct",
        medium: attributionRef.current?.medium ?? "none",
        campaign: attributionRef.current?.campaign ?? "",
        referrerHost: attributionRef.current?.referrerHost ?? "",
        lastAction: `Sayfa: ${pathname}`,
      });
    };

    const interval = window.setInterval(reTrack, 25000);
    const onVisible = () => {
      if (document.visibilityState === "visible") reTrack();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", reTrack);
    window.addEventListener("online", reTrack);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", reTrack);
      window.removeEventListener("online", reTrack);
    };
  }, [pathname, user?.id]);

  return null;
}
