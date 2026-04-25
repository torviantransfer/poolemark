import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Live ops dashboard data: last-30-min funnel + per-source performance.
 * Admin-only.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
  }
  const { data: adminUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (adminUser?.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
  }

  const admin = createAdminClient();
  const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  // 1) Site events (page_view, add_to_cart, initiate_checkout, purchase)
  const { data: events } = await admin
    .from("site_events")
    .select("event_type, session_id, metadata, created_at")
    .gte("created_at", since);

  type Ev = { event_type: string; session_id: string; metadata: Record<string, unknown> | null };
  const safeEvents: Ev[] = (events as Ev[] | null) || [];

  const uniqueSessionsByType = (eventType: string): Set<string> => {
    const set = new Set<string>();
    for (const ev of safeEvents) {
      if (ev.event_type === eventType && ev.session_id) set.add(ev.session_id);
    }
    return set;
  };

  const visitorSessions = uniqueSessionsByType("page_view");
  const addToCartSessions = uniqueSessionsByType("add_to_cart");
  const checkoutSessions = uniqueSessionsByType("initiate_checkout");
  const purchaseSessions = uniqueSessionsByType("purchase");

  // 2) Per-source breakdown (use earliest source seen for each session)
  const sourceForSession = new Map<string, string>();
  for (const ev of safeEvents) {
    if (ev.event_type !== "page_view" || !ev.session_id) continue;
    if (sourceForSession.has(ev.session_id)) continue;
    const source = String(((ev.metadata as { source?: unknown } | null)?.source ?? "direct"))
      .toLowerCase()
      .trim() || "direct";
    sourceForSession.set(ev.session_id, source);
  }

  const sourceVisitors = new Map<string, number>();
  const sourcePurchases = new Map<string, number>();
  const sourceRevenue = new Map<string, number>();
  for (const [sid, src] of sourceForSession) {
    sourceVisitors.set(src, (sourceVisitors.get(src) || 0) + 1);
    if (purchaseSessions.has(sid)) {
      sourcePurchases.set(src, (sourcePurchases.get(src) || 0) + 1);
    }
  }
  // Revenue per source (sum metadata.value on purchase events)
  for (const ev of safeEvents) {
    if (ev.event_type !== "purchase" || !ev.session_id) continue;
    const src = sourceForSession.get(ev.session_id) || "direct";
    const value = Number((ev.metadata as { value?: unknown } | null)?.value ?? 0);
    if (Number.isFinite(value) && value > 0) {
      sourceRevenue.set(src, (sourceRevenue.get(src) || 0) + value);
    }
  }

  const sources = Array.from(sourceVisitors.entries())
    .map(([source, visitors]) => {
      const purchases = sourcePurchases.get(source) || 0;
      const revenue = sourceRevenue.get(source) || 0;
      const conversionRate = visitors > 0 ? (purchases / visitors) * 100 : 0;
      return {
        source,
        visitors,
        purchases,
        revenue,
        conversionRate: Number(conversionRate.toFixed(2)),
      };
    })
    .sort((a, b) => b.visitors - a.visitors);

  // 3) Total revenue (last 30 min)
  let revenue = 0;
  for (const ev of safeEvents) {
    if (ev.event_type !== "purchase") continue;
    const value = Number((ev.metadata as { value?: unknown } | null)?.value ?? 0);
    if (Number.isFinite(value)) revenue += value;
  }

  const visitors = visitorSessions.size;
  const purchases = purchaseSessions.size;
  const conversionRate =
    visitors > 0 ? Number(((purchases / visitors) * 100).toFixed(2)) : 0;

  return NextResponse.json({
    sinceISO: since,
    summary: {
      visitors,
      addToCart: addToCartSessions.size,
      initiateCheckout: checkoutSessions.size,
      purchases,
      revenue,
      conversionRate,
    },
    sources,
  });
}
