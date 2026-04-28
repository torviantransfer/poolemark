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
 */
export function getFbcFromCookie(): string | null {
  const fromCookie = readCookie("_fbc");
  if (fromCookie) return fromCookie;

  if (typeof window === "undefined") return null;
  // Use a raw regex instead of URLSearchParams to avoid auto-decoding
  // percent-encoded characters — Meta Pixel reads fbclid from the URL raw.
  const raw = window.location.search.match(/[?&]fbclid=([^&#]*)/);
  const fbclid = raw ? raw[1] : null;
  if (!fbclid) return null;
  return `fb.1.${Date.now()}.${fbclid}`;
}
