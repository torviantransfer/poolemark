import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/services/products";
import { formatPrice } from "@/lib/helpers";

export const runtime = "nodejs";
export const alt = "Poolemark Ürün";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            fontSize: 64,
            color: "#E8712B",
            fontWeight: 700,
          }}
        >
          Poolemark
        </div>
      ),
      size,
    );
  }

  const image =
    product.images?.find((i) => i.is_primary)?.url ||
    product.images?.[0]?.url ||
    null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Left: image */}
        <div
          style={{
            width: 630,
            height: 630,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F7F4EE",
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={product.name}
              width={580}
              height={580}
              style={{ objectFit: "contain" }}
            />
          ) : (
            <div style={{ fontSize: 80, color: "#E8712B" }}>Poolemark</div>
          )}
        </div>

        {/* Right: details */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "60px 56px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 22,
                color: "#E8712B",
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              {product.category?.name || "Poolemark"}
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: "#1F1F1F",
                lineHeight: 1.15,
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.name}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: "#E8712B",
              }}
            >
              {formatPrice(product.price)}
            </div>
            <div
              style={{
                fontSize: 22,
                color: "#737373",
                marginTop: 12,
              }}
            >
              500₺ üzeri ücretsiz kargo · poolemark.com
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
