"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

/**
 * Top-level safety net: catches errors thrown by the root layout itself
 * (e.g. MetaPixel/PresenceTracker mounted in layout.tsx) that a nested
 * error.tsx cannot catch. Deliberately dependency-free (no Tailwind/UI
 * components) since this can render when the rest of the app failed to.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="tr">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "12px" }}>
          Bir şeyler ters gitti
        </h1>
        <p style={{ color: "#666", maxWidth: "360px", marginBottom: "24px" }}>
          Sayfa yüklenirken beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: "#E8712B",
              color: "#fff",
              border: "none",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Tekrar Dene
          </button>
          <Link
            href="/"
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              color: "#333",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </body>
    </html>
  );
}
