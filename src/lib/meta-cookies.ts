/**
 * Read Meta cookies (_fbp, _fbc) for Conversions API deduplication.
 * Browser-only.
 */

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
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
  const fbclid = new URL(window.location.href).searchParams.get("fbclid");
  if (!fbclid) return null;
  return `fb.1.${Date.now()}.${fbclid}`;
}
