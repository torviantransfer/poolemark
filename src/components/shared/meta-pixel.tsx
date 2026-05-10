"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { generateEventId, trackEvent } from "@/lib/meta-pixel";
import { getFbcFromCookie, getFbpFromCookie } from "@/lib/meta-cookies";
import { useUser } from "@/hooks/use-user";

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

declare global {
  interface Window {
    clientParamBuilder?: {
      processAndCollectAllParams: (
        url?: string,
        getIpFn?: () => Promise<string>
      ) => Promise<Record<string, string | null>>;
      getFbc: () => string | null;
      getFbp: () => string | null;
    };
  }
}

/**
 * Base Meta Pixel snippet.
 * Loaded once in the root layout. Disabled if no Pixel ID is configured.
 */
export function MetaPixel() {
  if (!PIXEL_ID) return null;

  return (
    <>
      {/* Meta CAPI Parameter Builder — improves fbp/fbc coverage and EMQ score */}
      <Script
        id="meta-capi-param-builder"
        src="https://unpkg.com/meta-capi-param-builder-clientjs@1.3.0/dist/clientParamBuilder.bundle.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Sets _fbp / _fbc cookies with SDK appendix format as soon as script loads
          void window.clientParamBuilder?.processAndCollectAllParams(window.location.href);
        }}
      />
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
          fbq('init', '${PIXEL_ID}', {});
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
  const { user } = useUser();

  // Re-init pixel with advanced matching data when user is available
  useEffect(() => {
    if (!PIXEL_ID || !user || typeof window.fbq !== "function") return;

    const matchData: Record<string, string> = {};
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

    if (Object.keys(matchData).length > 0) {
      window.fbq("init", PIXEL_ID, matchData);
    }
  }, [user]);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      // Race-safe: also called in onLoad above, but cover the case where script
      // was already cached and onLoad fired before this effect.
      void window.clientParamBuilder?.processAndCollectAllParams(window.location.href);
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
            user: { fbp: getFbpFromCookie(), fbc: getFbcFromCookie() },
          }),
        }).catch(() => {});
      }
      return;
    }
    if (!PIXEL_ID) return;
    // Refresh param builder on SPA navigation so fbc/fbp cookies stay current
    void window.clientParamBuilder?.processAndCollectAllParams(window.location.href);
    const id = generateEventId();
    trackEvent("PageView", {}, { eventId: id });
  }, [pathname, searchParams]);

  return null;
}
