const BASE_URL = "https://poolemark.com";

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Poolemark",
    url: BASE_URL,
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
      price: Number(price.toFixed(2)),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Poolemark",
        url: BASE_URL,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "TRY",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "TR",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };

  if (rating && reviewCount && reviewCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(rating.toFixed(1)),
      reviewCount: Number(reviewCount),
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface ItemListProduct {
  name: string;
  slug: string;
  image?: string | null;
  price?: number | null;
}

export function ItemListJsonLd({
  name,
  items,
}: {
  name: string;
  items: ItemListProduct[];
}) {
  if (!items.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${BASE_URL}/products/${item.slug}`,
      name: item.name,
      ...(item.image ? { image: item.image } : {}),
    })),
  };

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
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
