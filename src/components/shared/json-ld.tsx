const BASE_URL = "https://poolemark.com";

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Poolemark",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: "Ev gereçleri, dekorasyon ürünleri, PVC panel, duvar kaplama ve daha fazlası. 2018'den bu yana Antalya'dan tüm Türkiye'ye.",
    foundingDate: "2018-11-04",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+908508401327",
      email: "info@poolemark.com",
      contactType: "customer service",
      availableLanguage: "Turkish",
      areaServed: "TR",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Sedir Mahallesi, NO:18",
      addressLocality: "Muratpaşa",
      addressRegion: "Antalya",
      addressCountry: "TR",
    },
    sameAs: [
      "https://www.instagram.com/poolemark",
      "https://www.facebook.com/poolemark",
      "https://x.com/poolemark",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Poolemark",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/arama?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  href: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  image: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  sku?: string;
}

export function ProductJsonLd({
  name,
  description,
  image,
  slug,
  price,
  compareAtPrice,
  inStock,
  rating,
  reviewCount,
  sku,
}: ProductJsonLdProps) {
  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    url: `${BASE_URL}/products/${slug}`,
    sku: sku || slug,
    brand: {
      "@type": "Brand",
      name: "Poolemark",
    },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/products/${slug}`,
      priceCurrency: "TRY",
      price: price.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Poolemark",
      },
    },
  };

  if (rating && reviewCount) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.toFixed(1),
      reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BlogPostJsonLdProps {
  title: string;
  description: string;
  slug: string;
  image?: string;
  publishedAt: string;
  updatedAt?: string;
  authorName: string;
}

export function BlogPostJsonLd({
  title,
  description,
  slug,
  image,
  publishedAt,
  updatedAt,
  authorName,
}: BlogPostJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url: `${BASE_URL}/blog/${slug}`,
    image: image || `${BASE_URL}/og-image.png`,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Poolemark",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
