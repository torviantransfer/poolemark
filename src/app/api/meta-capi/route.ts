/**
 * Meta Conversions API proxy.
 *
 * Receives a normalized event payload from the browser, hashes PII,
 * and forwards it to the Facebook Graph endpoint.
 *
 * Required env:
 *   META_PIXEL_ID       — pixel id (server-side; mirrors NEXT_PUBLIC_FB_PIXEL_ID)
 *   META_CAPI_TOKEN     — long-lived access token from Events Manager
 * Optional:
 *   META_TEST_EVENT_CODE — when set, pushes events to the test bucket
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

interface CapiUser {
  email?: string | null;
  phone?: string | null;
  externalId?: string | null;
  fbp?: string | null;
  fbc?: string | null;
}

interface CapiPayload {
  event: string;
  eventId: string;
  eventSourceUrl?: string;
  params?: Record<string, unknown>;
  user?: CapiUser;
}

const PIXEL_ID = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE;
const ENDPOINT = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string): string {
  // Keep digits only; Meta expects E.164-ish without "+"
  return phone.replace(/\D+/g, "");
}

function isIPv6(ip: string): boolean {
  return ip.includes(":");
}

function getClientIp(request: NextRequest): string | null {
  // Prefer IPv6 over IPv4 as recommended by Meta CAPI best practices.
  // Cloudflare sends the real IP; x-forwarded-for may contain a comma-separated list.
  const cf6 = request.headers.get("cf-connecting-ipv6");
  if (cf6) return cf6.trim();

  const candidates: string[] = [];

  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    candidates.push(...fwd.split(",").map((s) => s.trim()).filter(Boolean));
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) candidates.push(realIp.trim());

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) candidates.push(cfIp.trim());

  // Return first IPv6 address found, otherwise fall back to first IPv4.
  return candidates.find(isIPv6) ?? candidates[0] ?? null;
}

export async function POST(request: NextRequest) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    // Silently accept so the browser doesn't see errors when CAPI isn't configured.
    return NextResponse.json({ ok: true, skipped: true });
  }

  let body: CapiPayload;
  try {
    body = (await request.json()) as CapiPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  if (!body?.event || !body?.eventId) {
    return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });
  }

  const userData: Record<string, string> = {};
  if (body.user?.email) userData.em = sha256(normalizeEmail(body.user.email));
  if (body.user?.phone) userData.ph = sha256(normalizePhone(body.user.phone));
  if (body.user?.externalId) userData.external_id = sha256(body.user.externalId);
  if (body.user?.fbp) userData.fbp = body.user.fbp;
  if (body.user?.fbc) userData.fbc = body.user.fbc;

  // Server-side fallback: read _fbp/_fbc directly from request cookies.
  // The Meta CAPI Parameter Builder SDK sets these cookies with proper appendix
  // format on the client; they are sent automatically with same-origin requests.
  if (!userData.fbp) {
    const fbpCookie = request.cookies.get("_fbp")?.value;
    if (fbpCookie) userData.fbp = fbpCookie;
  }
  if (!userData.fbc) {
    const fbcCookie = request.cookies.get("_fbc")?.value;
    if (fbcCookie) userData.fbc = fbcCookie;
  }

  const clientIp = getClientIp(request);
  if (clientIp) userData.client_ip_address = clientIp;
  const userAgent = request.headers.get("user-agent");
  if (userAgent) userData.client_user_agent = userAgent;

  const eventTime = Math.floor(Date.now() / 1000);

  const fbBody: Record<string, unknown> = {
    data: [
      {
        event_name: body.event,
        event_time: eventTime,
        event_id: body.eventId,
        event_source_url: body.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: body.params || {},
      },
    ],
  };

  if (TEST_EVENT_CODE) {
    fbBody.test_event_code = TEST_EVENT_CODE;
  }

  try {
    const res = await fetch(`${ENDPOINT}?access_token=${ACCESS_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fbBody),
      // Don't keep the function alive
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[meta-capi] non-2xx:", res.status, text);
      return NextResponse.json({ ok: false }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[meta-capi] fetch error:", err);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
