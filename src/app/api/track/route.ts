import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const ALLOWED = new Set([
  "page_view",
  "add_to_cart",
  "initiate_checkout",
  "purchase",
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false }, { status: 400 });

    const event_type = String(body.event_type || "");
    if (!ALLOWED.has(event_type)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const session_id = String(body.session_id || "").slice(0, 64);
    if (!session_id) return NextResponse.json({ ok: false }, { status: 400 });

    const path = body.path ? String(body.path).slice(0, 500) : null;
    const user_id = body.user_id ? String(body.user_id) : null;
    const metadata =
      body.metadata && typeof body.metadata === "object" ? body.metadata : null;

    const supabase = createAdminClient();
    await supabase.from("site_events").insert({
      event_type,
      session_id,
      user_id,
      path,
      metadata,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
