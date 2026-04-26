import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPossibleOrderNumbersFromMerchantOid, verifyPayTRCallback } from "@/lib/paytr";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const merchantOid = formData.get("merchant_oid") as string;
    const status = formData.get("status") as string;
    const totalAmount = formData.get("total_amount") as string;
    const hash = formData.get("hash") as string;

    console.log("[PayTR Callback] received", { merchantOid, status, totalAmount, hasHash: !!hash });

    // Verify hash
    if (!verifyPayTRCallback(merchantOid, status, totalAmount, hash)) {
      console.error("[PayTR Callback] hash mismatch", { merchantOid, status, totalAmount });
      return new NextResponse("PAYTR notification hash mismatch", { status: 400 });
    }

    console.log("[PayTR Callback] hash verified OK");

    const supabase = createAdminClient();

    const possibleOrderNumbers = getPossibleOrderNumbersFromMerchantOid(merchantOid);
    console.log("[PayTR Callback] looking for order numbers", possibleOrderNumbers);

    // Find order by order_number
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, payment_status, order_number, subtotal, shipping_cost, discount_amount, total")
      .in("order_number", possibleOrderNumbers)
      .single();

    if (!order) {
      console.error("[PayTR Callback] order not found", { possibleOrderNumbers, orderError });
      return new NextResponse("OK"); // PayTR expects "OK"
    }

    console.log("[PayTR Callback] order found", { orderId: order.id, currentStatus: order.payment_status });

    // Prevent duplicate processing
    if (order.payment_status === "paid" || order.payment_status === "failed") {
      console.log("[PayTR Callback] already processed, skipping");
      return new NextResponse("OK");
    }

    if (status === "success") {
      // Payment successful
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
        })
        .eq("id", order.id);

      console.log("[PayTR Callback] update result", { updateError });
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

        await sendOrderConfirmationEmail(recipientEmail, {
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
      const failureCode = formData.get("failed_reason_code") as string | null;
      const failureReason = formData.get("failed_reason_msg") as string | null;
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          status: "cancelled",
          payment_failure_code: failureCode || null,
          payment_failure_reason: failureReason || null,
        })
        .eq("id", order.id);
    }

    // PayTR requires "OK" response
    console.log("[PayTR Callback] done, returning OK");
    return new NextResponse("OK");
  } catch (error) {
    console.error("PayTR callback error:", error);
    return new NextResponse("OK"); // Always return OK to prevent retries
  }
}
