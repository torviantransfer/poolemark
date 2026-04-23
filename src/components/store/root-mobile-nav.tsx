"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MobileBottomNav } from "@/components/store/mobile-bottom-nav";

export function RootMobileNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Admin ve auth sayfalarında gösterme
  if (pathname.startsWith("/admin")) return null;
  if (pathname.startsWith("/giris") || pathname.startsWith("/kayit") || pathname.startsWith("/sifre")) return null;

  return <MobileBottomNav />;
}
