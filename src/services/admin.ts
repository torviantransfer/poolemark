import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdminStats() {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const [
    { count: totalCustomers },
    { count: todayOrders },
    { data: todaySales },
    { data: pendingOrderIds },
    { count: lowStockProducts },
    { count: unreadMessages },
    { count: pendingReviews },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "customer"),
    // Yarım bırakılan ödemeleri (payment_status=pending) istatistiklere dahil etme.
    supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", todayISO).neq("payment_status", "pending"),
    supabase.from("orders").select("total").gte("created_at", todayISO).eq("payment_status", "paid"),
    supabase.from("orders").select("id").eq("status", "pending").neq("payment_status", "pending"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true).lt("stock_quantity", 5),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("is_approved", false),
  ]);

  let pendingOrders = pendingOrderIds?.length || 0;
  if (pendingOrderIds && pendingOrderIds.length > 0) {
    const pendingIds = pendingOrderIds.map((o) => o.id);
    const { data: activeReturns } = await supabase
      .from("order_return_requests")
      .select("order_id,status")
      .in("order_id", pendingIds)
      .neq("status", "rejected");

    const activeReturnOrderIds = new Set(
      (activeReturns || []).map((r) => r.order_id)
    );
    pendingOrders = pendingIds.filter((id) => !activeReturnOrderIds.has(id)).length;
  }

  const todayRevenue = todaySales?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

  return {
    totalCustomers: totalCustomers || 0,
    todayOrders: todayOrders || 0,
    todayRevenue,
    pendingOrders: pendingOrders || 0,
    lowStockProducts: lowStockProducts || 0,
    unreadMessages: unreadMessages || 0,
    pendingReviews: pendingReviews || 0,
  };
}

export async function getTodayFunnelStats() {
  // site_events has RLS enabled with no policies — must use service role.
  const supabase = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const countFor = async (event_type: string) => {
    const { count } = await supabase
      .from("site_events")
      .select("session_id", { count: "exact", head: true })
      .eq("event_type", event_type)
      .gte("created_at", todayISO);
    return count || 0;
  };

  const uniqueSessionsFor = async (event_type: string) => {
    const { data } = await supabase
      .from("site_events")
      .select("session_id")
      .eq("event_type", event_type)
      .gte("created_at", todayISO);
    if (!data) return 0;
    return new Set(data.map((r) => r.session_id)).size;
  };

  // Bugünkü tekil ziyaretçileri yeni / geri dönen olarak ayır.
  // Geri dönen = bugünden önce de page_view fırlatmış session_id.
  const splitNewVsReturning = async () => {
    const { data: todayRows } = await supabase
      .from("site_events")
      .select("session_id")
      .eq("event_type", "page_view")
      .gte("created_at", todayISO);
    if (!todayRows || todayRows.length === 0) {
      return { newVisitors: 0, returningVisitors: 0 };
    }
    const todaySessionIds = Array.from(
      new Set(todayRows.map((r) => r.session_id).filter(Boolean))
    );
    if (todaySessionIds.length === 0) {
      return { newVisitors: 0, returningVisitors: 0 };
    }
    const { data: priorRows } = await supabase
      .from("site_events")
      .select("session_id")
      .eq("event_type", "page_view")
      .lt("created_at", todayISO)
      .in("session_id", todaySessionIds);
    const returningSet = new Set((priorRows || []).map((r) => r.session_id));
    const returningVisitors = todaySessionIds.filter((sid) => returningSet.has(sid)).length;
    const newVisitors = todaySessionIds.length - returningVisitors;
    return { newVisitors, returningVisitors };
  };

  const [
    visitors,
    addToCart,
    initiateCheckout,
    purchase,
    totalPageViews,
    { newVisitors, returningVisitors },
  ] = await Promise.all([
    uniqueSessionsFor("page_view"),
    uniqueSessionsFor("add_to_cart"),
    uniqueSessionsFor("initiate_checkout"),
    uniqueSessionsFor("purchase"),
    countFor("page_view"),
    splitNewVsReturning(),
  ]);

  return {
    visitors,
    pageViews: totalPageViews,
    addToCart,
    initiateCheckout,
    purchase,
    newVisitors,
    returningVisitors,
  };
}

/**
 * Bugünkü tekil ziyaretçileri trafik kaynağına göre gruplar.
 * Bir session_id için kullanılan ilk metadata.source değeri esas alınır.
 */
export async function getTodayTrafficSources() {
  const supabase = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const { data } = await supabase
    .from("site_events")
    .select("session_id, metadata, created_at")
    .eq("event_type", "page_view")
    .gte("created_at", todayISO)
    .order("created_at", { ascending: true });

  if (!data) return [] as { source: string; visitors: number }[];

  const sourceForSession = new Map<string, string>();
  for (const row of data) {
    const sid = row.session_id as string;
    if (!sid || sourceForSession.has(sid)) continue;
    const meta = (row.metadata || {}) as { source?: string };
    const src = (meta.source || "direct").toLowerCase();
    sourceForSession.set(sid, src);
  }

  const counts = new Map<string, number>();
  for (const src of sourceForSession.values()) {
    counts.set(src, (counts.get(src) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([source, visitors]) => ({ source, visitors }))
    .sort((a, b) => b.visitors - a.visitors);
}

/**
 * Bugün en çok terk edilen sayfalar (site_leave eventlerinden).
 * Aynı session_id aynı path'ten birden fazla kez ayrılmışsa tek sayılır.
 */
export async function getTodayExitPages(limit = 5) {
  const supabase = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const { data } = await supabase
    .from("site_events")
    .select("session_id, path, created_at")
    .eq("event_type", "site_leave")
    .gte("created_at", todayISO);

  if (!data) return [] as { path: string; exits: number }[];

  const seen = new Set<string>();
  const counts = new Map<string, number>();
  for (const row of data) {
    const path = (row.path as string) || "(bilinmiyor)";
    const sid = (row.session_id as string) || "";
    const dedupKey = `${sid}::${path}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);
    counts.set(path, (counts.get(path) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([path, exits]) => ({ path, exits }))
    .sort((a, b) => b.exits - a.exits)
    .slice(0, limit);
}

export async function getRecentOrders(limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, user:users!user_id(first_name, last_name, email), return_requests:order_return_requests(status, created_at)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getLowStockProducts(limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, stock_quantity, low_stock_threshold, price")
    .eq("is_active", true)
    .lt("stock_quantity", 10)
    .order("stock_quantity", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getTopSellingProducts(limit = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_items")
    .select("product_id, product_name, product_image, quantity")
    .order("quantity", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
