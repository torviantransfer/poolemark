import { ImageResponse } from "next/og";
import { getBlogPostBySlug } from "@/services/blog";

export const runtime = "nodejs";
export const alt = "Poolemark Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug).catch(() => null);

  if (!post) {
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
          Poolemark Blog
        </div>
      ),
      size,
    );
  }

  const cover = post.cover_image_url;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={post.title}
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              objectFit: "cover",
              filter: "brightness(0.55)",
            }}
          />
        )}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: 64,
            width: "100%",
            height: "100%",
            color: "#fff",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#FFB070",
              marginBottom: 16,
            }}
          >
            Poolemark Blog
          </div>
          <div
            style={{
              fontSize: 60,
              fontWeight: 800,
              lineHeight: 1.15,
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textShadow: "0 2px 12px rgba(0,0,0,0.4)",
            }}
          >
            {post.title}
          </div>
          <div
            style={{
              fontSize: 22,
              marginTop: 20,
              opacity: 0.85,
            }}
          >
            poolemark.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
