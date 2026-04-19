import crypto from "crypto";

const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID!;
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!;
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!;
const PAYTR_BASE_URL = "https://www.paytr.com/odeme/api/get-token";

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

export async function createPayTRToken(params: PayTRTokenParams): Promise<string> {
  const merchantOid = params.orderNumber;
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
    (Math.round(item.price * 100)).toString(),
    item.quantity.toString(),
  ]);
  const userBasket = Buffer.from(JSON.stringify(basketItems)).toString("base64");

  const merchantOkUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/odeme-sonucu?status=success&order=${params.orderId}`;
  const merchantFailUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/odeme-sonucu?status=fail&order=${params.orderId}`;

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

  const data = await response.json();

  if (data.status !== "success") {
    throw new Error(data.reason || "PayTR token oluşturulamadı");
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
