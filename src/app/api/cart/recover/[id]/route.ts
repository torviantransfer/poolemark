import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Public endpoint to recover the contents of an abandoned (payment_status='pending')
 * order so the cart can be repopulated when a customer clicks the WhatsApp recovery link.
 *
 * Security:
 * - Only `payment_status = 'pending'` orders can be recovered (paid orders not exposed).
 * - Order ID is a uuid (sufficient unguessable token for this use case).
 * - We only expose the minimum data needed to rebuild the cart (no addresses, no PII).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Basic uuid sanity check
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ error: "Geçersiz sipariş" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, payment_status")
      .eq("id", id)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }
    if (order.payment_status !== "pending") {
      return NextResponse.json({ error: "Bu sipariş kurtarılamaz" }, { status: 410 });
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, product_name, variant_info, quantity, unit_price")
      .eq("order_id", order.id);

    if (!items || items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Resolve product details (slug, image, current price/stock) so we can reconstruct cart shape.
    const productIds = Array.from(new Set(items.map((i) => i.product_id).filter(Boolean) as string[]));
    const { data: products } = await supabase
      .from("products")
      .select(
        "id, name, slug, price, compare_at_price, stock_quantity, is_active, images:product_images(url, is_primary, sort_order)"
      )
      .in("id", productIds);

    const productMap = new Map((products || []).map((p) => [p.id, p]));

    const recovered = items
      .map((it) => {
        const p = it.product_id ? productMap.get(it.product_id) : null;
        if (!p || !p.is_active) return null;
        const sortedImages = Array.isArray(p.images)
          ? [...p.images].sort((a, b) => {
              if (a.is_primary && !b.is_primary) return -1;
              if (!a.is_primary && b.is_primary) return 1;
              return (a.sort_order ?? 0) - (b.sort_order ?? 0);
            })
          : [];
        const image = sortedImages[0]?.url ?? null;
        return {
          product_id: p.id,
          variant_id: null as string | null, // variant restoration not modeled here
          name: p.name,
          slug: p.slug,
          image,
          price: p.price,
          compare_at_price: p.compare_at_price,
          quantity: it.quantity,
          stock_quantity: p.stock_quantity,
          variant_name: it.variant_info ?? null,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ items: recovered });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sepet kurtarılamadı" },
      { status: 500 }
    );
  }
}
