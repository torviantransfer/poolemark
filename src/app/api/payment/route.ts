import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPayTRToken, normalizePayTRUserIp, PayTRError } from "@/lib/paytr";
import { sendCodConfirmationTemplate } from "@/lib/whatsapp";
import { sendOrderConfirmationEmail } from "@/lib/email";

interface CodSettings {
  enabled: boolean;
  fee: number;
  minAmount: number;
  maxAmount: number;
  onlineDiscountPercent: number;
  whatsappConfirmation: boolean;
}

function parseNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

function parseBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

async function loadCodSettings(
  adminClient: ReturnType<typeof createAdminClient>
): Promise<CodSettings> {
  const { data } = await adminClient
    .from("site_settings")
    .select("key, value")
    .in("key", [
      "cod_enabled",
      "cod_fee",
      "cod_min_amount",
      "cod_max_amount",
      "cod_online_discount_percent",
      "cod_whatsapp_confirmation",
    ]);

  const map = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
  return {
    enabled: parseBool(map.cod_enabled),
    fee: parseNumber(map.cod_fee),
    minAmount: parseNumber(map.cod_min_amount),
    maxAmount: parseNumber(map.cod_max_amount),
    onlineDiscountPercent: parseNumber(map.cod_online_discount_percent),
    whatsappConfirmation: map.cod_whatsapp_confirmation === undefined ? true : parseBool(map.cod_whatsapp_confirmation),
  };
}

function buildOrderNumberFromIdempotencyKey(key: string): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  // Hash'i base36'ya çevirip ilk 6 hanesini kullan → 36^6 ≈ 2 milyar kombinasyon.
  // Karışmasın diye 0/O ve 1/I/L harflerini at.
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  const bigPart = BigInt("0x" + hash.slice(0, 16));
  let raw = bigPart.toString(36).toUpperCase();
  raw = raw.replace(/[01OIL]/g, "");
  // 6 karaktere sıkıştır; eksikse hash sonundan tamamla.
  if (raw.length < 6) {
    raw = (raw + hash.toUpperCase().replace(/[^A-Z2-9]/g, "")).slice(0, 6);
  }
  const code = raw.slice(0, 6);
  return `PM${year}-${code}`;
}

function isUniqueViolation(error: { code?: string } | null | undefined): boolean {
  return error?.code === "23505";
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { addressId, guestAddress, items, shippingCompanyId, couponCode, notes, idempotencyKey, invoice } = body;
    const paymentMethod = body.paymentMethod === "cash_on_delivery" ? "cash_on_delivery" : "credit_card";
    const codPaymentType = body.codPaymentType === "card" ? "card" : "cash";
    const isCod = paymentMethod === "cash_on_delivery";

    const normalizedIdempotencyKey = typeof idempotencyKey === "string" ? idempotencyKey.trim() : "";
    if (!normalizedIdempotencyKey) {
      return NextResponse.json({ error: "İşlem anahtarı eksik. Lütfen sayfayı yenileyip tekrar deneyin." }, { status: 400 });
    }

    if (!items?.length) {
      return NextResponse.json({ error: "Ürünler gerekli" }, { status: 400 });
    }

    if (!shippingCompanyId) {
      return NextResponse.json({ error: "Kargo firması seçilmelidir" }, { status: 400 });
    }

    // === SERVER-SIDE PRICE VALIDATION ===
    // Fetch actual prices from database
    const productIds = items.map((i: { product_id: string }) => i.product_id);
    const variantIds = items.filter((i: { variant_id?: string }) => i.variant_id).map((i: { variant_id: string }) => i.variant_id);

    const { data: products } = await adminClient
      .from("products")
      .select("id, price, compare_at_price, stock_quantity, name, cod_enabled")
      .in("id", productIds);

    let variants: { id: string; price: number; stock_quantity: number }[] = [];
    if (variantIds.length > 0) {
      const { data: v } = await adminClient
        .from("product_variants")
        .select("id, price, stock_quantity")
        .in("id", variantIds);
      variants = v || [];
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ error: "Ürünler bulunamadı" }, { status: 400 });
    }

    // Validate each item's price and stock
    let calculatedSubtotal = 0;
    const validatedItems: { product_id: string; variant_id?: string; name: string; variant_name?: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) {
        return NextResponse.json({ error: `Ürün bulunamadı: ${item.name}` }, { status: 400 });
      }

      let actualPrice = product.price;
      let stockQty = product.stock_quantity;

      if (item.variant_id) {
        const variant = variants.find((v) => v.id === item.variant_id);
        if (!variant) {
          return NextResponse.json({ error: `Varyant bulunamadı: ${item.variant_name || item.name}` }, { status: 400 });
        }
        actualPrice = variant.price;
        stockQty = variant.stock_quantity;
      }

      // Check stock
      if (item.quantity > stockQty) {
        return NextResponse.json({ error: `Stok yetersiz: ${product.name} (mevcut: ${stockQty})` }, { status: 400 });
      }

      calculatedSubtotal += actualPrice * item.quantity;
      validatedItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id || undefined,
        name: item.name || product.name,
        variant_name: item.variant_name,
        quantity: item.quantity,
        price: actualPrice,
      });
    }

    // Calculate shipping from selected shipping company
    const { data: shippingCompany } = await adminClient
      .from("shipping_companies")
      .select("id, name, price, free_shipping_threshold")
      .eq("id", shippingCompanyId)
      .eq("is_active", true)
      .single();

    if (!shippingCompany) {
      return NextResponse.json({ error: "Geçerli bir kargo firması seçilmelidir" }, { status: 400 });
    }

    const calculatedShipping =
      shippingCompany.free_shipping_threshold && calculatedSubtotal >= shippingCompany.free_shipping_threshold
        ? 0
        : shippingCompany.price;

    // Validate coupon server-side
    let calculatedDiscount = 0;
    if (couponCode) {
      const { data: coupon } = await adminClient
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (coupon) {
        const now = new Date();
        const isValid =
          (!coupon.starts_at || new Date(coupon.starts_at) <= now) &&
          (!coupon.expires_at || new Date(coupon.expires_at) >= now) &&
          (!coupon.max_uses || coupon.used_count < coupon.max_uses) &&
          (!coupon.min_order_amount || calculatedSubtotal >= coupon.min_order_amount);

        if (isValid) {
          if (coupon.type === "percentage") {
            calculatedDiscount = (calculatedSubtotal * coupon.value) / 100;
          } else if (coupon.type === "fixed" || coupon.type === "fixed_amount") {
            calculatedDiscount = coupon.value;
          }
          calculatedDiscount = Math.min(calculatedDiscount, calculatedSubtotal);

          // Increment coupon usage
          await adminClient
            .from("coupons")
            .update({ used_count: coupon.used_count + 1 })
            .eq("id", coupon.id);
        }
      }
    }

    // === KAPIDA ÖDEME UYGUNLUK & ÜCRET / ONLINE İNDİRİM ===
    const codSettings = await loadCodSettings(adminClient);
    let codFee = 0;
    let onlineDiscount = 0;

    if (isCod) {
      if (!codSettings.enabled) {
        return NextResponse.json({ error: "Kapıda ödeme şu anda kullanılamıyor." }, { status: 400 });
      }
      if (codSettings.minAmount > 0 && calculatedSubtotal < codSettings.minAmount) {
        return NextResponse.json(
          { error: `Kapıda ödeme için minimum sepet tutarı ${codSettings.minAmount.toLocaleString("tr-TR")} ₺.` },
          { status: 400 }
        );
      }
      if (codSettings.maxAmount > 0 && calculatedSubtotal > codSettings.maxAmount) {
        return NextResponse.json(
          { error: `Kapıda ödeme için maksimum sepet tutarı ${codSettings.maxAmount.toLocaleString("tr-TR")} ₺.` },
          { status: 400 }
        );
      }
      const codDisabled = (products || []).filter((p) => p.cod_enabled === false);
      if (codDisabled.length > 0) {
        return NextResponse.json(
          { error: "Sepetinizdeki bazı ürünler kapıda ödemeye uygun değil. Lütfen online ödeme seçin." },
          { status: 400 }
        );
      }
      codFee = codSettings.fee > 0 ? codSettings.fee : 0;
    } else if (codSettings.onlineDiscountPercent > 0) {
      onlineDiscount = Math.round(calculatedSubtotal * codSettings.onlineDiscountPercent) / 100;
      onlineDiscount = Math.min(onlineDiscount, calculatedSubtotal - calculatedDiscount);
    }

    const calculatedTotal =
      calculatedSubtotal - calculatedDiscount - onlineDiscount + calculatedShipping + codFee;

    // Use server-calculated values (ignore client values)
    const subtotal = calculatedSubtotal;
    const shipping = calculatedShipping;
    const discount = calculatedDiscount + onlineDiscount;
    const total = calculatedTotal;

    let shippingAddressJson: Record<string, string>;
    let userEmail: string;
    let userName: string;
    let userPhone: string;
    let userId: string | null = user?.id || null;

    if (user && addressId) {
      // Logged-in user with saved address
      const { data: address } = await adminClient
        .from("addresses")
        .select("*")
        .eq("id", addressId)
        .eq("user_id", user.id)
        .single();

      if (!address) {
        return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
      }

      const { data: userData } = await adminClient
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

      // === AUTO-REGISTER GUEST AS CUSTOMER ===
      // Find existing public.users row by email; if none, create an auth user.
      try {
        const normalizedEmail = email.trim().toLowerCase();
        const { data: existingProfile } = await adminClient
          .from("users")
          .select("id")
          .eq("email", normalizedEmail)
          .maybeSingle();

        if (existingProfile?.id) {
          userId = existingProfile.id;
        } else {
          const randomPassword = crypto.randomBytes(24).toString("base64url");
          const { data: createdUser } = await adminClient.auth.admin.createUser({
            email: normalizedEmail,
            password: randomPassword,
            email_confirm: true,
            user_metadata: {
              first_name,
              last_name,
              phone,
            },
          });
          if (createdUser?.user?.id) {
            userId = createdUser.user.id;
            // Trigger inserts public.users row; ensure phone is saved
            await adminClient
              .from("users")
              .update({ first_name, last_name, phone })
              .eq("id", userId);
          }
        }

        // Save the guest address as a permanent address for future logins
        if (userId) {
          await adminClient.from("addresses").insert({
            user_id: userId,
            title: "Teslimat Adresi",
            first_name,
            last_name,
            phone,
            city,
            district,
            neighborhood: neighborhood || "",
            postal_code: postal_code || "",
            address_line,
            is_default: true,
          });
        }
      } catch {
        // Auto-register is best-effort; fall back to true guest checkout.
        userId = null;
      }
    } else {
      return NextResponse.json({ error: "Teslimat adresi gerekli" }, { status: 400 });
    }

    const orderNumber = buildOrderNumberFromIdempotencyKey(normalizedIdempotencyKey);

    // Build billing address (kurumsal / bireysel fatura bilgileri)
    const invoiceType = invoice?.type === "corporate" ? "corporate" : "individual";
    const billingAddressJson: Record<string, string> = {
      ...shippingAddressJson,
      invoice_type: invoiceType,
    };
    if (invoiceType === "corporate") {
      const companyName = (invoice?.companyName || "").toString().trim();
      const taxOffice = (invoice?.taxOffice || "").toString().trim();
      const taxId = (invoice?.taxId || "").toString().trim();
      if (!companyName || !taxOffice || !taxId) {
        return NextResponse.json(
          { error: "Kurumsal fatura için firma adı, vergi dairesi ve vergi numarası zorunludur." },
          { status: 400 }
        );
      }
      billingAddressJson.company_name = companyName;
      billingAddressJson.tax_office = taxOffice;
      billingAddressJson.tax_id = taxId;
    }

    // Create order
    const { data: order, error } = await adminClient
      .from("orders")
      .insert({
        user_id: userId,
        guest_email: userId ? null : userEmail,
        order_number: orderNumber,
        status: "pending",
        payment_status: "pending",
        payment_method: paymentMethod,
        cargo_company: shippingCompany.name,
        subtotal,
        shipping_cost: shipping,
        discount_amount: discount || 0,
        total,
        cod_fee: isCod ? codFee : 0,
        cod_payment_type: isCod ? codPaymentType : null,
        cod_confirmation_status: isCod ? "pending" : null,
        shipping_address_json: shippingAddressJson,
        billing_address_json: billingAddressJson,
        notes: notes || null,
      })
      .select("id")
      .single();

    if (isUniqueViolation(error)) {
      const { data: existingOrder } = await adminClient
        .from("orders")
        .select("id, order_number, total, payment_status, status")
        .eq("order_number", orderNumber)
        .single();

      if (existingOrder) {
        // Kapıda ödeme siparişinde PayTR token'ı üretilmez; mevcut siparişi döndür.
        if (isCod) {
          return NextResponse.json({
            success: true,
            cod: true,
            orderId: existingOrder.id,
            orderNumber: existingOrder.order_number,
          });
        }

        // If the previous attempt failed or was cancelled, reopen it so PayTR accepts a new token.
        const isStale =
          existingOrder.payment_status === "failed" ||
          existingOrder.status === "cancelled";

        if (isStale) {
          await adminClient
            .from("orders")
            .update({ payment_status: "pending", status: "pending" })
            .eq("id", existingOrder.id);
        }

        const userIp = normalizePayTRUserIp(
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          request.headers.get("x-vercel-forwarded-for") ||
          request.headers.get("cf-connecting-ip")
        );

        const token = await createPayTRToken({
          orderId: existingOrder.id,
          orderNumber: existingOrder.order_number,
          userEmail,
          userIp,
          userName,
          userPhone,
          userAddress: `${shippingAddressJson.address_line}, ${shippingAddressJson.neighborhood || ""} ${shippingAddressJson.district}/${shippingAddressJson.city}`,
          items: validatedItems.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          totalAmount: Number(existingOrder.total ?? total),
        });

        return NextResponse.json({
          success: true,
          token,
          orderId: existingOrder.id,
          orderNumber: existingOrder.order_number,
        });
      }
    }

    if (error || !order) {
      console.error("Order insert error:", error);
      return NextResponse.json(
        { error: error?.message || "Sipariş oluşturulamadı" },
        { status: 500 }
      );
    }

    // Create order items (using server-validated prices)
    const orderItems = validatedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name,
      product_image: null,
      variant_info: item.variant_name || null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }));

    const { error: orderItemsError } = await adminClient.from("order_items").insert(orderItems);
    if (orderItemsError) {
      console.error("Order items insert error:", orderItemsError);
      return NextResponse.json(
        { error: orderItemsError.message || "Sipariş ürünleri kaydedilemedi" },
        { status: 500 }
      );
    }

    // === KAPIDA ÖDEME: PayTR yok, WhatsApp onayı gönder ===
    if (isCod) {
      // Stok düş (kapıda ödeme siparişi gerçek sipariştir).
      for (const item of validatedItems) {
        await adminClient.rpc("decrement_stock", {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        });
      }

      // WhatsApp onay mesajı (env yapılandırıldıysa).
      if (codSettings.whatsappConfirmation) {
        const itemSummary = `${validatedItems.reduce((s, i) => s + i.quantity, 0)} adet`;
        const deliveryLocation = `${shippingAddressJson.district} / ${shippingAddressJson.city}`;
        const result = await sendCodConfirmationTemplate({
          toPhone: userPhone,
          customerName: userName,
          orderNumber,
          itemSummary,
          total,
          deliveryLocation,
        });
        if (result.ok) {
          await adminClient
            .from("orders")
            .update({
              cod_whatsapp_message_id: result.messageId,
              cod_whatsapp_sent_at: new Date().toISOString(),
            })
            .eq("id", order.id);
        } else {
          console.warn("[COD] WhatsApp onay gönderilemedi:", result.error);
          Sentry.captureMessage(`[COD] WhatsApp onay gönderilemedi: ${result.error}`, {
            level: "warning",
            extra: { orderNumber, toPhone: userPhone },
          });
        }
      }

      // Sipariş onay e-postası.
      try {
        await sendOrderConfirmationEmail(userEmail, {
          firstName: userName,
          orderNumber,
          orderId: order.id,
          items: validatedItems.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          subtotal,
          shippingCost: shipping,
          discount: discount || 0,
          total,
          codFee,
          isCod: true,
        });
      } catch (emailErr) {
        console.warn("[COD] Onay e-postası gönderilemedi:", emailErr);
      }

      return NextResponse.json({
        success: true,
        cod: true,
        orderId: order.id,
        orderNumber,
      });
    }

    // Get user IP
    const userIp = normalizePayTRUserIp(
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-vercel-forwarded-for") ||
      request.headers.get("cf-connecting-ip")
    );

    // Create PayTR token
    const token = await createPayTRToken({
      orderId: order.id,
      orderNumber,
      userEmail,
      userIp,
      userName,
      userPhone,
      userAddress: `${shippingAddressJson.address_line}, ${shippingAddressJson.neighborhood || ""} ${shippingAddressJson.district}/${shippingAddressJson.city}`,
      items: validatedItems.map((item) => ({
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
    const userError =
      err instanceof PayTRError
        ? err.userMessage
        : err instanceof Error
        ? err.message
        : "Ödeme başlatılamadı";
    return NextResponse.json(
      { error: userError },
      { status: 500 }
    );
  }
}
