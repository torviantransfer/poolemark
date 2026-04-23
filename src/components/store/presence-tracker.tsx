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

export function PresenceTracker() {
  const pathname = usePathname();
  const { user } = useUser();
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const geoRef = useRef<{ city: string; country: string; region: string } | null>(null);

  useEffect(() => {
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
        await channel.track({
          path: pathname,
          userId: user?.id || null,
          joinedAt: new Date().toISOString(),
          city: geoRef.current.city,
          country: geoRef.current.country,
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
      path: pathname,
      userId: user?.id || null,
      joinedAt: new Date().toISOString(),
      city: geoRef.current?.city ?? "",
      country: geoRef.current?.country ?? "",
    });
  }, [pathname, user?.id]);

  return null;
}
