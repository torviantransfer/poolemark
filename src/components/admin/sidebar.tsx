"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_NAV_LINKS } from "@/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Ticket,
  FileText,
  File,
  Image,
  Megaphone,
  MessageSquare,
  Star,
  Activity,
  BarChart3,
  Settings,
  Truck,
  RotateCcw,
  Menu,
  LogOut,
  ChevronDown,
  X,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Ticket,
  Truck,
  RotateCcw,
  FileText,
  File,
  Image,
  Megaphone,
  MessageSquare,
  Star,
  BarChart3,
  Activity,
  Settings,
};

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const key = `admin-${crypto.randomUUID()}`;
    const channel = supabase.channel("online-visitors-admin-sidebar", {
      config: { presence: { key } },
    });

    const updateCount = () => {
      const presence = channel.presenceState<Record<string, unknown>[]>();
      const total = Object.values(presence).reduce(
        (sum, list) => sum + list.length,
        0
      );
      setOnlineCount(total);
    };

    channel.on("presence", { event: "sync" }, updateCount);
    channel.on("presence", { event: "join" }, updateCount);
    channel.on("presence", { event: "leave" }, updateCount);

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ role: "admin-sidebar", joinedAt: new Date().toISOString() });
      }
    });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/giris");
  }

  const navContent = (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
      {ADMIN_NAV_LINKS.map((link) => {
        const Icon = ICON_MAP[link.icon] || LayoutDashboard;
        const isActive =
          pathname === link.href ||
          (link.href !== "/admin" && pathname.startsWith(link.href));
        const hasChildren = "children" in link && link.children;
        const isExpanded = expanded === link.href;

        return (
          <div key={link.href}>
            <Link
              href={hasChildren ? "#" : link.href}
              onClick={(e) => {
                if (hasChildren) {
                  e.preventDefault();
                  setExpanded(isExpanded ? null : link.href);
                } else {
                  setMobileOpen(false);
                }
              }}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/70 hover:text-foreground hover:bg-secondary/80 hover:translate-x-0.5"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{link.label}</span>
              {link.href === "/admin/canli-ziyaretciler" && onlineCount > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
                  {onlineCount}
                </span>
              )}
              {hasChildren && (
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              )}
            </Link>
            {hasChildren && isExpanded && (
              <div className="ml-7 mt-1 space-y-1">
                {link.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block px-3 py-2 rounded-lg text-sm transition-colors",
                      pathname === child.href
                        ? "text-primary font-medium bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    )}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-white/95 backdrop-blur border-r shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] z-30">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b shrink-0">
          <Link
            href="/admin"
            className="text-lg font-bold text-primary tracking-tight"
          >
            Poolemark
            <span className="text-xs font-normal text-muted-foreground ml-1.5">
              Admin
            </span>
          </Link>
          {onlineCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              {onlineCount} online
            </span>
          )}
        </div>

        {navContent}

        {/* Bottom Actions */}
        <div className="p-3 border-t bg-secondary/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-14 bg-white/95 backdrop-blur border-b z-30 flex items-center justify-between px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="p-2 -ml-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-secondary/80 transition-colors">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="p-4 pb-3 border-b">
              <SheetTitle>
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-bold text-primary"
                >
                  Poolemark Admin
                </Link>
              </SheetTitle>
            </SheetHeader>
            {navContent}
            <div className="p-3 border-t">
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Çıkış Yap
              </button>
            </div>
          </SheetContent>
        </Sheet>

        <Link
          href="/admin"
          className="text-base font-bold text-primary tracking-tight"
        >
          Poolemark
        </Link>

        <div className="w-9" /> {/* Spacer for alignment */}
      </header>
    </>
  );
}
