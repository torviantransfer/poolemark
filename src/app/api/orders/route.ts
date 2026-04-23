import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { generateOrderNumber } from "@/lib/helpers";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }

    const body = await request.json();
    const { addressId, items, subtotal, shipping, discount, total, notes } = body;

    if (!addressId || !items?.length) {
      return NextResponse.json({ error: "Adres ve ürünler gerekli" }, { status: 400 });
    }

    // Get address
    const { data: address } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .eq("user_id", user.id)
      .single();

    if (!address) {
      return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
    }

    const orderNumber = generateOrderNumber();

    // Create order
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "pending",
        payment_status: "pending",
        payment_method: "credit_card",
        subtotal,
        shipping_cost: shipping,
        discount_amount: discount || 0,
        total,
        shipping_address_json: {
          title: address.title,
          first_name: address.first_name,
          last_name: address.last_name,
          phone: address.phone,
          city: address.city,
          district: address.district,
          postal_code: address.postal_code,
          neighborhood: address.neighborhood,
          address_line: address.address_line,
        },
        notes: notes || null,
      })
      .select("id")
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Sipariş oluşturulamadı" },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name,
      product_image: item.image || null,
      variant_info: item.variant_name || null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }));

    await supabase.from("order_items").insert(orderItems);

    // Update stock
    for (const item of items) {
      await supabase.rpc("decrement_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });
    }

    // Send order confirmation email
    const firstName = user.user_metadata?.first_name || "Değerli Müşterimiz";
    if (user.email) {
      await sendOrderConfirmationEmail(user.email, {
        firstName,
        orderNumber,
        orderId: order.id,
        items: items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image || undefined,
        })),
        subtotal,
        shippingCost: shipping,
        discount: discount || 0,
        total,
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber,
    });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
