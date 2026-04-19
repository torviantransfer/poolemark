import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPayTRToken } from "@/lib/paytr";
import { generateOrderNumber } from "@/lib/helpers";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { addressId, guestAddress, items, subtotal, shipping, discount, total, notes } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Ürünler gerekli" }, { status: 400 });
    }

    let shippingAddressJson: Record<string, string>;
    let userEmail: string;
    let userName: string;
    let userPhone: string;
    let userId: string | null = user?.id || null;

    if (user && addressId) {
      // Logged-in user with saved address
      const { data: address } = await supabase
        .from("addresses")
        .select("*")
        .eq("id", addressId)
        .eq("user_id", user.id)
        .single();

      if (!address) {
        return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
      }

      const { data: userData } = await supabase
        .from("users")
        .select("first_name, last_name, phone")
        .eq("id", user.id)
        .single();

      shippingAddressJson = {
        title: address.title,
        first_name: address.first_name,
        last_name: address.last_name,
        phone: address.phone,
        city: address.city,
        district: address.district,
        postal_code: address.postal_code || "",
        neighborhood: address.neighborhood || "",
        address_line: address.address_line,
      };
      userEmail = user.email!;
      userName = `${userData?.first_name || address.first_name} ${userData?.last_name || address.last_name}`.trim();
      userPhone = userData?.phone || address.phone || "05000000000";
    } else if (guestAddress) {
      // Guest checkout
      const { first_name, last_name, email, phone, city, district, neighborhood, postal_code, address_line } = guestAddress;
      if (!first_name || !last_name || !email || !phone || !city || !district || !address_line) {
        return NextResponse.json({ error: "Teslimat bilgileri eksik" }, { status: 400 });
      }
      shippingAddressJson = {
        first_name,
        last_name,
        phone,
        city,
        district,
        postal_code: postal_code || "",
        neighborhood: neighborhood || "",
        address_line,
      };
      userEmail = email;
      userName = `${first_name} ${last_name}`;
      userPhone = phone;
      userId = null;
    } else {
      return NextResponse.json({ error: "Teslimat adresi gerekli" }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();

    // Create order
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        guest_email: userId ? null : userEmail,
        order_number: orderNumber,
        status: "pending",
        payment_status: "pending",
        payment_method: "credit_card",
        subtotal,
        shipping_cost: shipping,
        discount_amount: discount || 0,
        total,
        shipping_address_json: shippingAddressJson,
        notes: notes || null,
      })
      .select("id")
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Sipariş oluşturulamadı" }, { status: 500 });
    }

    // Create order items
    const orderItems = items.map((item: { product_id: string; variant_id?: string; name: string; variant_name?: string; quantity: number; price: number }) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      product_name: item.name,
      variant_name: item.variant_name || null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }));

    await supabase.from("order_items").insert(orderItems);

    // Get user IP
    const userIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Create PayTR token
    const token = await createPayTRToken({
      orderId: order.id,
      orderNumber,
      userEmail,
      userIp,
      userName,
      userPhone,
      userAddress: `${shippingAddressJson.address_line}, ${shippingAddressJson.neighborhood || ""} ${shippingAddressJson.district}/${shippingAddressJson.city}`,
      items: items.map((item: { name: string; price: number; quantity: number }) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: total,
    });

    return NextResponse.json({
      success: true,
      token,
      orderId: order.id,
      orderNumber,
    });
  } catch (err: unknown) {
    console.error("Payment init error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ödeme başlatılamadı" },
      { status: 500 }
    );
  }
}
