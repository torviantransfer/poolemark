import { NextRequest, NextResponse } from "next/server";

// Bazı IP'lerde ip-api `city` alanına mahalle/köy ismi koyuyor (ör. "Yukarıkaraman").
// Şehir-il listesinde olmayan değerleri `regionName` ile değiştiriyoruz.
const TR_PROVINCES = new Set([
  "adana","adiyaman","afyonkarahisar","agri","aksaray","amasya","ankara","antalya","ardahan","artvin",
  "aydin","balikesir","bartin","batman","bayburt","bilecik","bingol","bitlis","bolu","burdur",
  "bursa","canakkale","cankiri","corum","denizli","diyarbakir","duzce","edirne","elazig","erzincan",
  "erzurum","eskisehir","gaziantep","giresun","gumushane","hakkari","hatay","igdir","isparta","istanbul",
  "izmir","kahramanmaras","karabuk","karaman","kars","kastamonu","kayseri","kilis","kirikkale","kirklareli",
  "kirsehir","kocaeli","konya","kutahya","malatya","manisa","mardin","mersin","mugla","mus",
  "nevsehir","nigde","ordu","osmaniye","rize","sakarya","samsun","sanliurfa","siirt","sinop",
  "sivas","sirnak","tekirdag","tokat","trabzon","tunceli","usak","van","yalova","yozgat","zonguldak",
]);

function normalizeForCompare(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z]/g, "");
}

function pickBestCity(city: string | undefined, region: string | undefined): string {
  const c = (city || "").trim();
  const r = (region || "").trim();
  if (!c) return r;
  if (!r) return c;
  // city gerçekten bir Türkiye ili mi?
  if (TR_PROVINCES.has(normalizeForCompare(c))) return c;
  // değilse il bilgisini tercih et
  return r;
}

// Country isimlerini Türkçe'ye normalize et: "Turkey" / "TR" / "Türkiye" → "Türkiye".
function normalizeCountry(country: string | undefined): string {
  if (!country) return "";
  const c = country.trim();
  if (c.toLowerCase() === "turkey" || c.toUpperCase() === "TR" || c === "Türkiye" || c.toLowerCase() === "turkiye") {
    return "Türkiye";
  }
  return c;
}

export async function GET(req: NextRequest) {
  // Gerçek IP'yi al (proxy/CDN arkasında da çalışır)
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") ?? "127.0.0.1";

  // Localhost/private IP'ler için geolocation çalışmaz
  const isLocal =
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.");

  if (isLocal) {
    return NextResponse.json({ city: "Yerel", country: "Türkiye", region: "" });
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,regionName,status`, {
      next: { revalidate: 3600 }, // Aynı IP için 1 saat cache
    });
    const data = await res.json();

    if (data.status === "success") {
      return NextResponse.json({
        city: pickBestCity(data.city, data.regionName),
        country: normalizeCountry(data.country),
        region: data.regionName || "",
      });
    }
  } catch {
    // Geolocation başarısız olursa boş dön
  }

  return NextResponse.json({ city: "", country: "", region: "" });
}
