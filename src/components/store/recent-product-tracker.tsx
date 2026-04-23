"use client";

import { useEffect } from "react";
import { trackRecentProduct } from "@/hooks/use-recent-products";

interface RecentProductTrackerProps {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
}

export function RecentProductTracker({
  id,
  slug,
  name,
  image,
  price,
  compareAtPrice,
}: RecentProductTrackerProps) {
  useEffect(() => {
    trackRecentProduct({
      id,
      slug,
      name,
      image,
      price,
      compare_at_price: compareAtPrice,
    });
  }, [id, slug, name, image, price, compareAtPrice]);

  return null;
}
