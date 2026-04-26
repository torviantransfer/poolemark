"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ChunkErrorHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const isChunkError =
        event.message?.includes("ChunkLoadError") ||
        event.message?.includes("Loading chunk") ||
        event.message?.includes("Failed to fetch dynamically imported module") ||
        event.message?.includes("error loading dynamically imported module");

      if (isChunkError) {
        router.refresh();
      }
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, [router]);

  // Sekme tekrar aktif olduğunda router'ı refresh et
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [router]);

  return null;
}
