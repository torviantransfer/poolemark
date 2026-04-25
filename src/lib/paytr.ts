import crypto from "crypto";

function readEnv(name: "PAYTR_MERCHANT_ID" | "PAYTR_MERCHANT_KEY" | "PAYTR_MERCHANT_SALT" | "NEXT_PUBLIC_SITE_URL") {
  return (process.env[name] || "").trim();
}

const PAYTR_MERCHANT_ID = readEnv("PAYTR_MERCHANT_ID");
const PAYTR_MERCHANT_KEY = readEnv("PAYTR_MERCHANT_KEY");
const PAYTR_MERCHANT_SALT = readEnv("PAYTR_MERCHANT_SALT");
const PAYTR_BASE_URL = "https://www.paytr.com/odeme/api/get-token";
const PAYTR_REFUND_URL = "https://www.paytr.com/odeme/iade";

interface PayTRTokenParams {
  orderId: string;
  orderNumber: string;
  userEmail: string;
  userIp: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  items: { name: string; price: number; quantity: number }[];
  totalAmount: number; // in TRY (e.g. 150.90)
}

export function toPayTRMerchantOid(orderNumber: string): string {
  return orderNumber.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function getPossibleOrderNumbersFromMerchantOid(merchantOid: string): string[] {
  const normalized = merchantOid.trim().toUpperCase();
  const candidates = new Set<string>([normalized]);

  // Eski format: PM-YYMM######## → PayTR'a PMYYMM######## gelir
  if (normalized.startsWith("PM") && !normalized.startsWith("PM-")) {
    candidates.add(`PM-${normalized.slice(2)}`);
  }

  // Yeni format: PMYY-XXXXXX → PayTR'a PMYYXXXXXX gelir (10 karakter, ilk 4'ü PMYY)
  if (/^PM\d{2}[A-Z0-9]{6}$/.test(normalized)) {
    candidates.add(`${normalized.slice(0, 4)}-${normalized.slice(4)}`);
  }

  return Array.from(candidates);
}

export function normalizePayTRUserIp(rawIp: string | null | undefined): string {
  const value = (rawIp || "").split(",")[0].trim();

  if (!value) return "127.0.0.1";

  const withoutMappedPrefix = value.replace(/^::ffff:/i, "");
  const withoutPort = withoutMappedPrefix.replace(/:(\d+)$/, (match, port, offset, full) => {
    return full.includes(".") ? "" : match;
  });

  return withoutPort || "127.0.0.1";
}

export async function createPayTRToken(params: PayTRTokenParams): Promise<string> {
  if (!PAYTR_MERCHANT_ID || !PAYTR_MERCHANT_KEY || !PAYTR_MERCHANT_SALT) {
    throw new Error("PayTR env değerleri eksik");
  }

  const merchantOid = toPayTRMerchantOid(params.orderNumber);
  const paymentAmount = Math.round(params.totalAmount * 100); // PayTR expects kuruş
  const currency = "TL";
  const testMode = process.env.PAYTR_TEST_MODE === "1" ? "1" : "0";
  const noInstallment = "1";
  const maxInstallment = "0";
  const timeout = "30";
  const debugOn = testMode;
  const lang = "tr";

  const basketItems = params.items.map((item) => [
    item.name,
    item.price.toFixed(2),
    item.quantity.toString(),
  ]);
  const userBasket = Buffer.from(JSON.stringify(basketItems)).toString("base64");

  const siteUrl = readEnv("NEXT_PUBLIC_SITE_URL");
  const merchantOkUrl = `${siteUrl}/odeme-sonucu?status=success&order=${params.orderId}`;
  const merchantFailUrl = `${siteUrl}/odeme-sonucu?status=fail&order=${params.orderId}`;

  // PayTR hash string
  const hashStr = `${PAYTR_MERCHANT_ID}${params.userIp}${merchantOid}${params.userEmail}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}`;
  const paytrToken = crypto
    .createHmac("sha256", PAYTR_MERCHANT_KEY)
    .update(hashStr + PAYTR_MERCHANT_SALT)
    .digest("base64");

  const formData = new URLSearchParams({
    merchant_id: PAYTR_MERCHANT_ID,
    user_ip: params.userIp,
    merchant_oid: merchantOid,
    email: params.userEmail,
    payment_amount: paymentAmount.toString(),
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: debugOn,
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: params.userName,
    user_address: params.userAddress,
    user_phone: params.userPhone,
    merchant_ok_url: merchantOkUrl,
    merchant_fail_url: merchantFailUrl,
    timeout_limit: timeout,
    currency,
    test_mode: testMode,
    lang,
  });

  const response = await fetch(PAYTR_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  const raw = await response.text();
  let data: { status?: string; reason?: string; token?: string } = {};
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`PayTR geçersiz yanıt döndürdü (HTTP ${response.status})`);
  }

  if (data.status !== "success" || !data.token) {
    const diagnostics = [
      `reason=${data.reason || "unknown"}`,
      `status=${response.status}`,
      `merchantIdLength=${PAYTR_MERCHANT_ID.length}`,
      `merchantKeyLength=${PAYTR_MERCHANT_KEY.length}`,
      `merchantSaltLength=${PAYTR_MERCHANT_SALT.length}`,
      `merchantIdPreview=${PAYTR_MERCHANT_ID.slice(0, 3)}`,
      `merchantOid=${merchantOid}`,
      `userIp=${params.userIp}`,
      `paymentAmount=${paymentAmount}`,
      `testMode=${testMode}`,
      `merchantOkUrl=${merchantOkUrl}`,
    ].join(", ");

    throw new Error(`PayTR token request failed: ${diagnostics}`);
  }

  return data.token;
}

export function verifyPayTRCallback(
  merchantOid: string,
  status: string,
  totalAmount: string,
  hash: string
): boolean {
  const hashStr = `${merchantOid}${PAYTR_MERCHANT_SALT}${status}${totalAmount}`;
  const token = crypto
    .createHmac("sha256", PAYTR_MERCHANT_KEY)
    .update(hashStr)
    .digest("base64");
  return token === hash;
}

interface PayTRRefundParams {
  orderNumber: string;
  returnAmount: number;
  referenceNo?: string;
}

export async function createPayTRRefund(params: PayTRRefundParams): Promise<{
  status: string;
  is_test?: string;
  merchant_oid?: string;
  return_amount?: string;
  reference_no?: string;
  err_no?: string;
  err_msg?: string;
}> {
  if (!PAYTR_MERCHANT_ID || !PAYTR_MERCHANT_KEY || !PAYTR_MERCHANT_SALT) {
    throw new Error("PayTR env değerleri eksik");
  }

  const merchantOid = toPayTRMerchantOid(params.orderNumber);
  const returnAmount = params.returnAmount.toFixed(2);
  const paytrToken = crypto
    .createHmac("sha256", PAYTR_MERCHANT_KEY)
    .update(`${PAYTR_MERCHANT_ID}${merchantOid}${returnAmount}${PAYTR_MERCHANT_SALT}`)
    .digest("base64");

  const formData = new URLSearchParams({
    merchant_id: PAYTR_MERCHANT_ID,
    merchant_oid: merchantOid,
    return_amount: returnAmount,
    paytr_token: paytrToken,
  });

  if (params.referenceNo) {
    formData.set("reference_no", params.referenceNo);
  }

  const response = await fetch(PAYTR_REFUND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  const raw = await response.text();
  let data: {
    status?: string;
    is_test?: string;
    merchant_oid?: string;
    return_amount?: string;
    reference_no?: string;
    err_no?: string;
    err_msg?: string;
  } = {};

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`PayTR iade geçersiz yanıt döndürdü (HTTP ${response.status})`);
  }

  if (data.status !== "success") {
    throw new Error(`PayTR iade başarısız: ${data.err_no || "unknown"} - ${data.err_msg || "Bilinmeyen hata"}`);
  }

  return {
    status: data.status,
    is_test: data.is_test,
    merchant_oid: data.merchant_oid,
    return_amount: data.return_amount,
    reference_no: data.reference_no,
    err_no: data.err_no,
    err_msg: data.err_msg,
  };
}
