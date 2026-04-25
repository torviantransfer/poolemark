"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackSiteEvent } from "@/lib/site-events";

function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackSiteEvent("page_view", { path: pathname || "/" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return null;
}

export function SiteEventsTracker() {
  return (
    <Suspense>
      <Tracker />
    </Suspense>
  );
}
