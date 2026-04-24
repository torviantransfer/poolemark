"use client";

import { useEffect } from "react";

export function NotFoundTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname + window.location.search;
    // Skip noisy paths from bots that hit known scanner targets
    if (/\.(php|asp|aspx|env|git|sql|zip)$/i.test(window.location.pathname)) {
      return;
    }
    fetch("/api/track-404", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        path,
        referrer: document.referrer || null,
      }),
    }).catch(() => {
      /* ignore */
    });
  }, []);

  return null;
}
