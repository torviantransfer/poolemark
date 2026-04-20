import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPayTRCallback } from "@/lib/paytr";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const merchantOid = formData.get("merchant_oid") as string;
    const status = formData.get("status") as string;
    const totalAmount = formData.get("total_amount") as string;
    const hash = formData.get("hash") as string;

    // Verify hash
    if (!verifyPayTRCallback(merchantOid, status, totalAmount, hash)) {
      return new NextResponse("PAYTR notification hash mismatch", { status: 400 });
    }

    const supabase = await createClient();

    // Find order by order_number (merchantOid = order_number)
    const { data: order } = await supabase
      .from("orders")
      .select("id, user_id, payment_status, order_number, subtotal, shipping_cost, discount_amount, total")
      .eq("order_number", merchantOid)
      .single();

    if (!order) {
      return new NextResponse("OK"); // PayTR expects "OK"
    }

    // Prevent duplicate processing
    if (order.payment_status === "paid" || order.payment_status === "failed") {
      return new NextResponse("OK");
    }

    if (status === "success") {
      // Payment successful
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "processing",
        })
        .eq("id", order.id);

      // Decrement stock
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", order.id);

      if (orderItems) {
        for (const item of orderItems) {
          await supabase.rpc("decrement_stock", {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          });
        }
      }

      // Send confirmation email
      let recipientEmail: string | null = null;
      let recipientName = "Değerli Müşterimiz";

      if (order.user_id) {
        const { data: userData } = await supabase
          .from("users")
          .select("email, first_name")
          .eq("id", order.user_id)
          .single();
        if (userData?.email) {
          recipientEmail = userData.email;
          recipientName = userData.first_name || recipientName;
        }
      }

      // Fallback to guest_email
      if (!recipientEmail) {
        const { data: orderFull } = await supabase
          .from("orders")
          .select("guest_email, shipping_address_json")
          .eq("id", order.id)
          .single();
        if (orderFull?.guest_email) {
          recipientEmail = orderFull.guest_email;
          const addrJson = orderFull.shipping_address_json as Record<string, string> | null;
          recipientName = addrJson?.first_name || recipientName;
        }
      }

      if (recipientEmail) {
        const { data: items } = await supabase
          .from("order_items")
          .select("product_name, quantity, unit_price")
          .eq("order_id", order.id);

        sendOrderConfirmationEmail(recipientEmail, {
          firstName: recipientName,
          orderNumber: order.order_number,
          orderId: order.id,
          items: (items || []).map((i) => ({
            name: i.product_name,
            quantity: i.quantity,
            price: i.unit_price,
          })),
          subtotal: order.subtotal,
          shippingCost: order.shipping_cost,
          discount: order.discount_amount,
          total: order.total,
        });
      }
    } else {
      // Payment failed
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          status: "cancelled",
        })
        .eq("id", order.id);
    }

    // PayTR requires "OK" response
    return new NextResponse("OK");
  } catch (error) {
    console.error("PayTR callback error:", error);
    return new NextResponse("OK"); // Always return OK to prevent retries
  }
}
