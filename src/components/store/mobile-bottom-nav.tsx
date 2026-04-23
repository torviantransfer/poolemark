"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useUser } from "@/hooks/use-user";
import { Home, Grid3X3, ShoppingBag, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Anasayfa", icon: Home },
  { href: "/products", label: "Ürünler", icon: Grid3X3 },
  { href: "/sepet", label: "Sepet", icon: ShoppingBag, showBadge: true },
  { href: "/hesabim/favorilerim", label: "Favoriler", icon: Heart, auth: true },
  { href: "/hesabim", label: "Hesabım", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { user } = useUser();

  return (
    <nav
      className="lg:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 2147483647,
        backgroundColor: "#ffffff",
        borderTop: "1px solid #e5e7eb",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
        paddingBottom: "env(safe-area-inset-bottom)",
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
        willChange: "transform",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", height: "64px" }}>
        {NAV_ITEMS.map((item) => {
          const href = !user && item.auth ? "/giris" : item.href;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={href}
              style={{ flex: 1 }}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                {item.showBadge && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-primary text-white text-[9px] font-bold px-1">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px]", isActive ? "font-semibold" : "font-medium")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}





