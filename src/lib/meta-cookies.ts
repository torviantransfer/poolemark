/**
 * Read Meta cookies (_fbp, _fbc) for Conversions API deduplication.
 * Browser-only.
 */

const RAW_FBC_STORAGE_KEY = "pm_meta_fbc_raw";
const RAW_FBC_COOKIE_KEY = "pm_meta_fbc_raw";
const RAW_FBC_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

const FBC_FORMAT = /^fb\.1\.\d+\..+$/;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  );
  // Return the raw value without decoding — Meta Pixel reads cookies without
  // decodeURIComponent, so we must send the same raw bytes to CAPI.
  return match ? match[1] : null;
}

function isValidFbc(value: string | null | undefined): value is string {
  return Boolean(value && FBC_FORMAT.test(value));
}

export function getFbpFromCookie(): string | null {
  return readCookie("_fbp");
}

function readRawFbcFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromLocal = window.localStorage.getItem(RAW_FBC_STORAGE_KEY);
    if (fromLocal) return fromLocal;
  } catch {
    // ignore storage access errors
  }
  try {
    const fromSession = window.sessionStorage.getItem(RAW_FBC_STORAGE_KEY);
    if (fromSession) return fromSession;
  } catch {
    // ignore storage access errors
  }
  return null;
}

function persistRawFbc(value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RAW_FBC_STORAGE_KEY, value);
  } catch {
    // ignore storage access errors
  }
  try {
    window.sessionStorage.setItem(RAW_FBC_STORAGE_KEY, value);
  } catch {
    // ignore storage access errors
  }
  try {
    document.cookie = `${RAW_FBC_COOKIE_KEY}=${value}; Max-Age=${RAW_FBC_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
  } catch {
    // ignore cookie write errors
  }
}

function extractFbclidFromFbc(fbc: string): string | null {
  const parts = fbc.split(".");
  if (parts.length < 4) return null;
  const fbclid = parts.slice(3).join(".");
  return fbclid || null;
}

export function getRawFbclidFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.location.search.match(/[?&]fbclid=([^&#]*)/);
  return raw ? raw[1] : null;
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
  const cookieFbc = readCookie("_fbc");
  if (typeof window === "undefined") return isValidFbc(cookieFbc) ? cookieFbc : null;

  const storedRawFbc = readRawFbcFromStorage() || readCookie(RAW_FBC_COOKIE_KEY);

  // URL takes priority over cookie: guarantees the raw, unmodified fbclid.
  const fbclid = getRawFbclidFromUrl();
  if (fbclid) {
    const cookieFbclid = cookieFbc ? extractFbclidFromFbc(cookieFbc) : null;
    if (isValidFbc(cookieFbc) && cookieFbclid === fbclid) {
      return cookieFbc;
    }

    const storedFbclid = storedRawFbc ? extractFbclidFromFbc(storedRawFbc) : null;
    if (storedRawFbc && isValidFbc(storedRawFbc) && storedFbclid === fbclid) {
      return storedRawFbc;
    }

    const value = `fb.1.${Date.now()}.${fbclid}`;
    persistRawFbc(value);
    return value;
  }

  if (isValidFbc(cookieFbc)) return cookieFbc;
  if (isValidFbc(storedRawFbc)) return storedRawFbc;

  // Avoid forwarding a potentially decoded/modified `_fbc` cookie value.
  // If we do not have a trusted raw value, skip fbc instead of sending bad data.
  return null;
}
