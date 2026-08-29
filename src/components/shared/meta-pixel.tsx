"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { generateEventId, trackEvent } from "@/lib/meta-pixel";
import { getFbcFromCookie, getFbpFromCookie, getRawFbclidFromUrl } from "@/lib/meta-cookies";
import { useUser } from "@/hooks/use-user";

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

/**
 * Base Meta Pixel snippet.
 * Loaded once in the root layout. Disabled if no Pixel ID is configured.
 *
 * NOTE: We do NOT load Meta's "CAPI Parameter Builder" SDK here. That SDK
 * overwrites the `_fbc`/`_fbp` cookies with its own "appendix" format on
 * every page load/navigation, which stomps on the raw fbclid we capture in
 * `lib/meta-cookies.ts` and triggers Meta's "modified fbclid" diagnostic on
 * events fired from pages that no longer have `?fbclid=` in the URL
 * (checkout, order confirmation, etc). `lib/meta-cookies.ts` already
 * reimplements the same job (capture the raw fbclid once, persist it,
 * never mutate it) without corrupting the cookie — keep using that instead
 * of re-adding this script.
 */
export function MetaPixel() {
  if (!PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          // Initial PageView is fired from PageViewTracker with a stable eventID
          // so it can deduplicate against the matching CAPI server PageView.
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense>
        <PageViewTracker />
      </Suspense>
    </>
  );
}

/** Fires PageView (browser + CAPI) on every SPA route change (skips initial load — covered by inline fbq snippet). */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);
  const didInitPixel = useRef(false);
  const { user, loading } = useUser();

  // Initialize the pixel exactly once. We wait until the auth check settles
  // (loading === false) so we only ever call fbq('init', PIXEL_ID, ...) a
  // single time — calling init twice for the same Pixel ID (once as guest,
  // once again after the user loads) triggers Facebook's own
  // "[Meta Pixel] - Duplicate Pixel ID" console warning.
  useEffect(() => {
    if (!PIXEL_ID || typeof window.fbq !== "function") return;
    if (loading || didInitPixel.current) return;

    const matchData: Record<string, string> = {};
    if (user) {
      if (user.email) matchData.em = user.email;
      if (user.phone) matchData.ph = user.phone;
      const meta = user.user_metadata as Record<string, string> | undefined;
      if (meta?.full_name) {
        const parts = (meta.full_name as string).trim().split(" ");
        if (parts[0]) matchData.fn = parts[0];
        if (parts.length > 1) matchData.ln = parts.slice(1).join(" ");
      } else {
        if (meta?.first_name) matchData.fn = meta.first_name;
        if (meta?.last_name) matchData.ln = meta.last_name;
      }
    }

    window.fbq("init", PIXEL_ID, matchData);
    didInitPixel.current = true;
  }, [user, loading]);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      // Fire the initial PageView ourselves with a stable eventID so the
      // browser Pixel and the server CAPI event share the same event_id and
      // Meta can deduplicate them. (The inline snippet no longer fires it.)
      if (PIXEL_ID) {
        const id = generateEventId();
        // 1) Browser Pixel with eventID
        if (typeof window.fbq === "function") {
          window.fbq("track", "PageView", {}, { eventID: id });
        }
        // 2) Server CAPI with the same event_id
        void fetch("/api/meta-capi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            event: "PageView",
            eventId: id,
            event_id: id,
            eventSourceUrl: window.location.href,
            params: {},
            user: {
              fbp: getFbpFromCookie(),
              fbc: getFbcFromCookie(),
              fbclidRaw: getRawFbclidFromUrl(),
            },
          }),
        }).catch(() => {});
      }
      return;
    }
    if (!PIXEL_ID) return;
    const id = generateEventId();
    trackEvent("PageView", {}, { eventId: id });
  }, [pathname, searchParams]);

  return null;
}
