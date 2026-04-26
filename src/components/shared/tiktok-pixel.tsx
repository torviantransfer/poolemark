"use client";

import Script from "next/script";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "D7N3LOJC77UA276UPEN0";

export function TikTokPixel() {
  if (!PIXEL_ID) return null;

  return (
    <>
      <Script id="tiktok-pixel-base" strategy="afterInteractive">
        {`
          !function (w, d, t) {
            w.TiktokAnalyticsObject = t;
            var ttq = w[t] = w[t] || [];
            ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
            ttq.setAndDefer = function (obj, method) {
              obj[method] = function () {
                obj.push([method].concat(Array.prototype.slice.call(arguments, 0)));
              };
            };
            for (var i = 0; i < ttq.methods.length; i++) {
              ttq.setAndDefer(ttq, ttq.methods[i]);
            }
            ttq.instance = function (pixel) {
              var inst = ttq._i[pixel] || [];
              for (var j = 0; j < ttq.methods.length; j++) {
                ttq.setAndDefer(inst, ttq.methods[j]);
              }
              return inst;
            };
            ttq.load = function (pixelId, options) {
              var sdk = "https://analytics.tiktok.com/i18n/pixel/events.js";
              ttq._i = ttq._i || {};
              ttq._i[pixelId] = [];
              ttq._i[pixelId]._u = sdk;
              ttq._t = ttq._t || {};
              ttq._t[pixelId] = +new Date();
              ttq._o = ttq._o || {};
              ttq._o[pixelId] = options || {};
              var script = d.createElement("script");
              script.type = "text/javascript";
              script.async = true;
              script.src = sdk + "?sdkid=" + pixelId + "&lib=" + t;
              var first = d.getElementsByTagName("script")[0];
              first.parentNode.insertBefore(script, first);
            };
            ttq.load("${PIXEL_ID}");
            ttq.page();
          }(window, document, "ttq");
        `}
      </Script>
      <Suspense>
        <TikTokPageViewTracker />
      </Suspense>
    </>
  );
}

function TikTokPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!PIXEL_ID) return;
    if (typeof window === "undefined") return;
    if (typeof window.ttq?.page === "function") {
      window.ttq.page();
    }
  }, [pathname, searchParams]);

  return null;
}
