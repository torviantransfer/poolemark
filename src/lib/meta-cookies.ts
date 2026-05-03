/**
 * Read Meta cookies (_fbp, _fbc) for Conversions API deduplication.
 * Browser-only.
 */

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  );
  // Return the raw value without decoding — Meta Pixel reads cookies without
  // decodeURIComponent, so we must send the same raw bytes to CAPI.
  return match ? match[1] : null;
}

export function getFbpFromCookie(): string | null {
  return readCookie("_fbp");
}

/**
 * `_fbc` cookie or, as a fallback, build it from `?fbclid=` in the URL.
 * Format: `fb.1.<timestamp>.<fbclid>`
 *
 * IMPORTANT: When fbclid is present in the URL we always build fbc from
 * the raw URL parameter — never from the cookie. Third-party SDKs such as
 * the Meta CAPI Parameter Builder may overwrite the `_fbc` cookie with a
 * decoded/modified fbclid value, which triggers the "modified fbclid" error
 * in Meta's Conversions API diagnostics.
 */
export function getFbcFromCookie(): string | null {
  if (typeof window === "undefined") return readCookie("_fbc");

  // URL takes priority over cookie: guarantees the raw, unmodified fbclid.
  const raw = window.location.search.match(/[?&]fbclid=([^&#]*)/);
  const fbclid = raw ? raw[1] : null;
  if (fbclid) return `fb.1.${Date.now()}.${fbclid}`;

  return readCookie("_fbc");
}
