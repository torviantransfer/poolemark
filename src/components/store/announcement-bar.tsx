"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Announcement {
  id: string;
  text: string;
  link_url: string | null;
  bg_color: string;
  text_color: string;
}

const BAR_HEIGHT = "36px";

export function AnnouncementBar() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [index, setIndex] = useState(0);

  // Aktif duyuruları yükle
  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    supabase
      .from("announcements")
      .select("id, text, link_url, bg_color, text_color")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (mounted && data) setItems(data as Announcement[]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Header ve içeriğin çubuk kadar aşağı kayması için CSS değişkeni ayarla
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--announcement-h", items.length > 0 ? BAR_HEIGHT : "0px");
    return () => {
      root.style.setProperty("--announcement-h", "0px");
    };
  }, [items.length]);

  // Birden fazla duyuru varsa sırayla döndür
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[index] ?? items[0];

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center text-center text-xs sm:text-sm font-medium"
      style={{
        height: BAR_HEIGHT,
        backgroundColor: current.bg_color || "#22C55E",
        color: current.text_color || "#FFFFFF",
      }}
    >
      {current.link_url ? (
        <Link href={current.link_url} className="truncate px-4 hover:underline">
          {current.text}
        </Link>
      ) : (
        <span className="truncate px-4">{current.text}</span>
      )}
    </div>
  );
}
