import { NextRequest, NextResponse } from "next/server";

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
    return NextResponse.json({ city: "Yerel", country: "TR", region: "" });
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,regionName,status`, {
      next: { revalidate: 3600 }, // Aynı IP için 1 saat cache
    });
    const data = await res.json();

    if (data.status === "success") {
      return NextResponse.json({ city: data.city, country: data.country, region: data.regionName });
    }
  } catch {
    // Geolocation başarısız olursa boş dön
  }

  return NextResponse.json({ city: "", country: "", region: "" });
}
