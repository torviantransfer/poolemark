import { createClient } from "@/lib/supabase/server";

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
    supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", todayISO),
    supabase.from("orders").select("total").gte("created_at", todayISO).eq("payment_status", "paid"),
    supabase.from("orders").select("id").eq("status", "pending"),
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
  const supabase = await createClient();
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

  const [visitors, addToCart, initiateCheckout, purchase, totalPageViews] =
    await Promise.all([
      uniqueSessionsFor("page_view"),
      uniqueSessionsFor("add_to_cart"),
      uniqueSessionsFor("initiate_checkout"),
      uniqueSessionsFor("purchase"),
      countFor("page_view"),
    ]);

  return {
    visitors,
    pageViews: totalPageViews,
    addToCart,
    initiateCheckout,
    purchase,
  };
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
