"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Package,
  MapPin,
  Heart,
  User,
  Bell,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Genel Bakış", href: "/hesabim", icon: LayoutDashboard, exact: true },
  { label: "Siparişlerim", href: "/hesabim/siparislerim", icon: Package },
  { label: "Adreslerim", href: "/hesabim/adreslerim", icon: MapPin },
  { label: "Favorilerim", href: "/hesabim/favorilerim", icon: Heart },
  { label: "Bilgilerim", href: "/hesabim/bilgilerim", icon: User },
  { label: "Bildirimler", href: "/hesabim/bildirimler", icon: Bell },
];

interface AccountSidebarProps {
  firstName: string;
  lastName: string;
  email: string;
}

export function AccountSidebar({ firstName, lastName, email }: AccountSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const initials =
    [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() ||
    (email[0] || "?").toUpperCase();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col gap-3 w-60 shrink-0 sticky top-24">
        {/* User card */}
        <div className="bg-white rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">
                {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Kullanıcı"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="bg-white rounded-2xl border overflow-hidden">
          {NAV_ITEMS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b last:border-b-0 ${
                  active
                    ? "bg-primary/5 text-primary font-semibold border-l-[3px] border-l-primary"
                    : "text-foreground hover:bg-secondary/60 border-l-[3px] border-l-transparent"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-l-[3px] border-l-transparent"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Çıkış Yap
          </button>
        </nav>
      </aside>

      {/* ── Mobile Top Nav ───────────────────────────────────── */}
      <nav className="lg:hidden flex items-center gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-4">
        {NAV_ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                active
                  ? "bg-primary text-white"
                  : "bg-white border text-foreground hover:bg-secondary/60"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap bg-white border text-red-600 hover:bg-red-50 transition-colors shrink-0"
        >
          <LogOut className="h-3.5 w-3.5" />
          Çıkış
        </button>
      </nav>
    </>
  );
}
