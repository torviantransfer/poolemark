import { NextRequest, NextResponse } from "next/server";

const GRAPH_VERSION = "v21.0";

// Tek seferlik yardımcı: WABA'yı uygulamaya abone eder (subscribed_apps).
// Basit koruma: ?secret=<WHATSAPP_VERIFY_TOKEN>
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret") || "";
  const verifyToken = (process.env.WHATSAPP_VERIFY_TOKEN || "").trim();
  if (!verifyToken || secret !== verifyToken) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const accessToken = (process.env.WHATSAPP_ACCESS_TOKEN || "").trim();
  const wabaId = (process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "860914383161416").trim();
  if (!accessToken) {
    return NextResponse.json({ ok: false, error: "WHATSAPP_ACCESS_TOKEN yok" }, { status: 500 });
  }

  const base = `https://graph.facebook.com/${GRAPH_VERSION}/${wabaId}/subscribed_apps`;
  const auth = { Authorization: `Bearer ${accessToken}` };

  // 1) Aboneliği aç.
  const postRes = await fetch(base, { method: "POST", headers: auth });
  const postJson = await postRes.json().catch(() => ({}));

  // 2) Mevcut abonelikleri oku (doğrulama).
  const getRes = await fetch(base, { headers: auth });
  const getJson = await getRes.json().catch(() => ({}));

  return NextResponse.json({
    ok: postRes.ok,
    wabaId,
    subscribeResult: postJson,
    currentSubscriptions: getJson,
  });
}
