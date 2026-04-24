import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { path?: unknown; referrer?: unknown }
      | null;

    if (!body) return NextResponse.json({ ok: false }, { status: 400 });

    const rawPath = typeof body.path === "string" ? body.path : "";
    const path = rawPath.slice(0, 500);
    if (!path || !path.startsWith("/")) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const referrer =
      typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;
    const userAgent =
      request.headers.get("user-agent")?.slice(0, 500) ?? null;

    const supabase = createAdminClient();
    await supabase.from("not_found_logs").insert({
      path,
      referrer,
      user_agent: userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
