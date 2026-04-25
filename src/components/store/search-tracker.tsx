"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/meta-pixel";
import { gaSearch } from "@/lib/ga";

interface SearchTrackerProps {
  query: string;
}

/**
 * Fires a Meta `Search` event whenever a non-empty query is rendered.
 * Mounted from the (server) search page; safe no-op when query is empty.
 */
export function SearchTracker({ query }: SearchTrackerProps) {
  useEffect(() => {
    if (!query) return;
    trackEvent("Search", { search_string: query });
    gaSearch(query);
  }, [query]);

  return null;
}
