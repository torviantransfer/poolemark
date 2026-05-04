/**
 * Server-side Meta Conversions API helper used from internal handlers
 * (e.g. PayTR webhook) where there is no browser to fire the Pixel.
 *
 * For dedup with the browser Pixel we accept an `eventId` from the caller.
 * For purchase events we use `purchase_<orderId>` so the redirect page
 * (PurchaseTracker) and the webhook share the same id.
 */

import crypto from "crypto";

const PIXEL_ID = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE;

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D+/g, "");
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeZip(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

interface ServerCapiInput {
  event: string;
  eventId: string;
  eventSourceUrl?: string;
  customData?: Record<string, unknown>;
  user?: {
    email?: string | null;
    phone?: string | null;
    externalId?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    country?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    fbp?: string | null;
    fbc?: string | null;
  };
}

/**
 * Send a single CAPI event from the server.
 * Returns void; failures are logged but never thrown.
 */
export async function sendServerCapiEvent(input: ServerCapiInput): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) return;

  // Event must always carry a stable event_id so browser/server dedup works.
  if (!input.eventId || !input.eventId.trim()) return;

  const userData: Record<string, string> = {};
  if (input.user?.email) userData.em = sha256(normalizeEmail(input.user.email));
  if (input.user?.phone) userData.ph = sha256(normalizePhone(input.user.phone));
  if (input.user?.externalId) userData.external_id = sha256(input.user.externalId);
  if (input.user?.firstName) userData.fn = sha256(normalizeText(input.user.firstName));
  if (input.user?.lastName) userData.ln = sha256(normalizeText(input.user.lastName));
  if (input.user?.city) userData.ct = sha256(normalizeText(input.user.city));
  if (input.user?.state) userData.st = sha256(normalizeText(input.user.state));
  if (input.user?.zip) userData.zp = sha256(normalizeZip(input.user.zip));
  if (input.user?.country) userData.country = sha256(normalizeText(input.user.country));
  if (input.user?.ip) userData.client_ip_address = input.user.ip;
  if (input.user?.userAgent) userData.client_user_agent = input.user.userAgent;
  if (input.user?.fbp) userData.fbp = input.user.fbp;
  if (input.user?.fbc) userData.fbc = input.user.fbc;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: input.event,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: input.customData || {},
      },
    ],
  };

  if (TEST_EVENT_CODE) body.test_event_code = TEST_EVENT_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[meta-capi server] non-2xx:", res.status, text);
    }
  } catch (err) {
    console.error("[meta-capi server] error:", err);
  }
}
