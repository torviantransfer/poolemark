"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "poolemark_recent_products";
const MAX_ITEMS = 12;

export interface RecentProduct {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  compare_at_price: number | null;
  viewedAt: number;
}

function readStorage(): RecentProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p) => p && typeof p.id === "string");
  } catch {
    return [];
  }
}

function writeStorage(items: RecentProduct[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded etc. — ignore
  }
}

export function trackRecentProduct(product: Omit<RecentProduct, "viewedAt">) {
  const list = readStorage();
  const filtered = list.filter((p) => p.id !== product.id);
  filtered.unshift({ ...product, viewedAt: Date.now() });
  writeStorage(filtered.slice(0, MAX_ITEMS));
}

export function useRecentProducts(excludeId?: string) {
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    const list = readStorage();
    setItems(excludeId ? list.filter((p) => p.id !== excludeId) : list);
  }, [excludeId]);

  return items;
}
