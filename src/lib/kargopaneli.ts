/**
 * Stocado (kargopaneli.com) kargo entegrasyonu.
 * Admin panelden tek tıkla gerçek gönderi oluşturur; takip numarası anında döner.
 * API çok minimaldir: sadece login + cargo oluştur/getir + bölge listeleri.
 */

const BASE_URL = "https://api.kargopaneli.com/v1";

// slug -> panelde/sitede gösterilecek Türkçe kargo firması adı.
export const KARGOPANELI_COMPANIES: { slug: string; name: string }[] = [
  { slug: "surat-kargo", name: "Sürat Kargo" },
  { slug: "yurtici-kargo", name: "Yurtiçi Kargo" },
  { slug: "ptt-kargo", name: "PTT Kargo" },
  { slug: "kolay-gelsin", name: "Kolay Gelsin" },
  { slug: "ups", name: "UPS Kargo" },
  { slug: "hepsijet", name: "HepsiJet" },
];

export function companyNameFromSlug(slug: string): string {
  return KARGOPANELI_COMPANIES.find((c) => c.slug === slug)?.name || slug;
}

function readEnv() {
  return {
    email: (process.env.KARGOPANELI_EMAIL || "").trim(),
    password: (process.env.KARGOPANELI_PASSWORD || "").trim(),
    accountId: (process.env.KARGOPANELI_ACCOUNT_ID || "").trim(),
    senderId: (process.env.KARGOPANELI_SENDER_ID || "").trim(),
  };
}

export function isKargopaneliConfigured(): boolean {
  const { email, password, accountId, senderId } = readEnv();
  return !!email && !!password && !!accountId && !!senderId;
}

// --- Token önbelleği (modül ömrü boyunca) ---
let cachedToken: string | null = null;
let cachedTokenExp = 0; // unix saniye

function parseJwtExp(token: string): number {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf8")
    );
    return typeof payload.exp === "number" ? payload.exp : 0;
  } catch {
    return 0;
  }
}

async function login(): Promise<string> {
  const { email, password } = readEnv();
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`Stocado giriş başarısız (http_${res.status})`);
  }
  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error("Stocado giriş başarısız: token yok");
  cachedToken = data.token;
  cachedTokenExp = parseJwtExp(data.token);
  return data.token;
}

async function getToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  // 5 dk marjla süresi geçmişse yeniden giriş yap.
  if (cachedToken && cachedTokenExp - 300 > now) return cachedToken;
  return login();
}

async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  let token = await getToken();
  const doFetch = (t: string) =>
    fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        Authorization: `Bearer ${t}`,
      },
    });

  let res = await doFetch(token);
  // Token beklenmedik şekilde geçersizse bir kez yenile.
  if (res.status === 401) {
    cachedToken = null;
    token = await login();
    res = await doFetch(token);
  }
  return res;
}

// --- Bölge (il/ilçe) çözümleme, önbellekli ---
type City = { id: number; name: string };
type District = { id: number; name: string };

let citiesCache: City[] | null = null;
const districtsCache = new Map<number, District[]>();

function normalizeTr(s: string): string {
  return (s || "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ")
    .replace(/i̇/g, "i"); // birleşik noktalı i düzeltmesi
}

async function getCities(): Promise<City[]> {
  if (citiesCache) return citiesCache;
  const res = await authFetch("/locations/countries/TR/cities");
  if (!res.ok) throw new Error(`Şehir listesi alınamadı (http_${res.status})`);
  citiesCache = (await res.json()) as City[];
  return citiesCache;
}

async function getDistricts(cityId: number): Promise<District[]> {
  const cached = districtsCache.get(cityId);
  if (cached) return cached;
  const res = await authFetch(`/locations/cities/${cityId}/districts`);
  if (!res.ok) throw new Error(`İlçe listesi alınamadı (http_${res.status})`);
  const list = (await res.json()) as District[];
  districtsCache.set(cityId, list);
  return list;
}

async function resolveCityId(cityName: string): Promise<number | null> {
  const target = normalizeTr(cityName);
  const cities = await getCities();
  const found = cities.find((c) => normalizeTr(c.name) === target);
  return found?.id ?? null;
}

async function resolveDistrictId(
  cityId: number,
  districtName: string
): Promise<number | null> {
  const target = normalizeTr(districtName);
  const districts = await getDistricts(cityId);
  const exact = districts.find((d) => normalizeTr(d.name) === target);
  if (exact) return exact.id;
  // "Merkez" gibi ekleri olan adları toleranslı eşle.
  const partial = districts.find(
    (d) => normalizeTr(d.name).startsWith(target) || target.startsWith(normalizeTr(d.name))
  );
  return partial?.id ?? null;
}

// --- Gönderi oluşturma ---
export interface CreateShipmentInput {
  cargoCompanyId: string; // slug (ör. "surat-kargo")
  receiver: {
    name: string;
    email: string;
    phone: string;
    city: string; // il adı (ör. "Antalya")
    district: string; // ilçe adı (ör. "Muratpaşa")
    details: string; // açık adres
    postalCode?: string;
  };
  desi: number;
  payOnDelivery: boolean;
  payOnDeliveryAmount: number;
  orderNumber: string;
}

export interface CreateShipmentResult {
  ok: boolean;
  trackingCode?: string;
  trackingLink?: string;
  cargoId?: string;
  error?: string;
}

export async function createShipment(
  input: CreateShipmentInput
): Promise<CreateShipmentResult> {
  if (!isKargopaneliConfigured()) {
    return { ok: false, error: "Stocado ayarları eksik (env)." };
  }

  const { accountId, senderId } = readEnv();

  const cityId = await resolveCityId(input.receiver.city);
  if (!cityId) {
    return { ok: false, error: `Şehir eşleşmedi: ${input.receiver.city}` };
  }
  const districtId = await resolveDistrictId(cityId, input.receiver.district);
  if (!districtId) {
    return {
      ok: false,
      error: `İlçe eşleşmedi: ${input.receiver.district} (${input.receiver.city})`,
    };
  }

  const body = {
    account_id: accountId,
    cargo_company_id: input.cargoCompanyId,
    local_id: senderId,
    direction: 1, // Gönder
    status: 1, // Aktif (API taslak/2 kabul etmiyor)
    package: {
      desi: input.desi,
      weight: input.desi,
      length: 10,
      width: 10,
      height: 10,
    },
    foreign_address: {
      title: "Teslimat Adresi",
      name: input.receiver.name,
      email: input.receiver.email || "musteri@poolemark.com",
      phone: input.receiver.phone,
      country_id: "TR",
      city_id: cityId,
      district_id: districtId,
      details: input.receiver.details,
      postal_code: input.receiver.postalCode || "",
      type: 1, // Bireysel
    },
    order_number: input.orderNumber,
    pay_on_delivery: input.payOnDelivery,
    pay_on_delivery_amount: input.payOnDelivery ? input.payOnDeliveryAmount : 0,
    pay_on_delivery_type: 1, // Nakit
    source: "api",
  };

  const res = await authFetch("/cargos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => null)) as {
    messages?: { text?: string; type?: string }[];
    errors?: Record<string, string[]>;
    message?: string;
    data?: {
      id?: string;
      process_number?: string;
      out_tracking_code?: string;
      out_tracking_link?: string;
    };
  } | null;

  if (!res.ok) {
    const firstErr =
      data?.message ||
      (data?.errors && Object.values(data.errors)[0]?.[0]) ||
      data?.messages?.find((m) => m.type === "error")?.text ||
      `http_${res.status}`;
    return { ok: false, error: firstErr };
  }

  // Kargo firmasına iletim başarısız olduysa messages içinde error döner.
  const errorMsg = data?.messages?.find((m) => m.type === "error")?.text;
  if (errorMsg && !data?.data?.out_tracking_code) {
    return { ok: false, error: errorMsg };
  }

  return {
    ok: true,
    trackingCode: data?.data?.out_tracking_code || "",
    trackingLink: data?.data?.out_tracking_link || "",
    cargoId: data?.data?.id || "",
  };
}
