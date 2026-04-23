"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { NAV_LINKS } from "@/constants";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Search,
  ShoppingBag,
  Heart,
  User,
  LogOut,
  Package,
  MapPin,
  Bell,
  Settings,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { MiniCart } from "@/components/store/mini-cart";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/arama?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  }

  const transparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        transparent
          ? "bg-transparent"
          : "bg-white/95 shadow-sm border-b border-border/40 md:backdrop-blur-xl"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-[68px]">
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger
                aria-label="Menüyü aç"
                className={cn(
                  "lg:hidden p-2 -ml-2 transition-colors",
                  transparent
                    ? "text-white/80 hover:text-white"
                    : "text-foreground/70 hover:text-foreground"
                )}
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-[320px] sm:w-[300px] p-0 flex flex-col overflow-hidden">
                <SheetHeader className="p-6 pb-4 border-b shrink-0">
                  <SheetTitle>
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xl font-bold text-primary"
                    >
                      Poolemark
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col py-4 flex-1 overflow-y-auto">
                  {NAV_LINKS.map((link) => {
                    const isActive =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "px-6 py-3.5 text-[15px] font-medium transition-colors",
                          isActive
                            ? "text-primary bg-primary/5 border-l-2 border-primary"
                            : "text-foreground/80 hover:text-primary hover:bg-primary/5"
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
                {!user && !loading && (
                  <div className="p-6 pt-4 border-t space-y-3 shrink-0">
                    <Button
                      render={
                        <Link
                          href="/giris"
                          onClick={() => setMobileMenuOpen(false)}
                        />
                      }
                      className="w-full"
                    >
                      Giriş Yap
                    </Button>
                    <Button
                      render={
                        <Link
                          href="/kayit"
                          onClick={() => setMobileMenuOpen(false)}
                        />
                      }
                      variant="outline"
                      className="w-full"
                    >
                      Kayıt Ol
                    </Button>
                  </div>
                )}
                {user && (
                  <div className="p-6 pt-2 border-t space-y-1 shrink-0">
                    <Link
                      href="/hesabim"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent/50 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Hesabım
                    </Link>
                    <Link
                      href="/hesabim/siparislerim"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent/50 transition-colors"
                    >
                      <Package className="h-4 w-4" />
                      Siparişlerim
                    </Link>
                    <Link
                      href="/hesabim/favorilerim"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent/50 transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                      Favorilerim
                    </Link>
                    <Link
                      href="/hesabim/bildirimler"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent/50 transition-colors"
                    >
                      <Bell className="h-4 w-4" />
                      Bildirimler
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-red-50 transition-colors w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            <Link
              href="/"
              className={cn(
                "text-xl md:text-2xl font-bold tracking-tight transition-colors",
                transparent
                  ? "text-white hover:text-white/90"
                  : "text-primary hover:text-primary/90"
              )}
            >
              Poolemark
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    transparent
                      ? isActive
                        ? "text-white bg-white/15"
                        : "text-white/75 hover:text-white hover:bg-white/10"
                      : isActive
                        ? "text-primary bg-primary/5"
                        : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {searchOpen ? (
              <form
                onSubmit={handleSearch}
                className="absolute inset-x-0 top-0 h-full bg-white z-10 flex items-center px-4 gap-3 animate-in fade-in duration-200"
              >
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <Input
                  type="search"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-base"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  aria-label="Aramayı kapat"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Arama yap"
                className={cn(
                  "p-2.5 transition-colors rounded-full",
                  transparent
                    ? "text-white/75 hover:text-white hover:bg-white/10"
                    : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                )}
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            {user && (
              <Link
                href="/hesabim/favorilerim"
                className={cn(
                  "hidden md:flex p-2.5 transition-colors rounded-full",
                  transparent
                    ? "text-white/75 hover:text-white hover:bg-white/10"
                    : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                )}
              >
                <Heart className="h-5 w-5" />
              </Link>
            )}

            <MiniCart transparent={transparent} />

            <div className="hidden md:block">
              {loading ? (
                <div className="w-9 h-9 rounded-full bg-secondary animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-colors",
                      transparent
                        ? "bg-white/20 text-white hover:bg-white/30"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {user.user_metadata?.first_name?.[0]?.toUpperCase() || "U"}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">
                        {user.user_metadata?.first_name}{" "}
                        {user.user_metadata?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/hesabim" />}>
                      <User className="mr-2 h-4 w-4" />
                      Hesabım
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      render={<Link href="/hesabim/siparislerim" />}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Siparişlerim
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      render={<Link href="/hesabim/adreslerim" />}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Adreslerim
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      render={<Link href="/hesabim/bilgilerim" />}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Bilgilerim
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      render={<Link href="/hesabim/bildirimler" />}
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Bildirimler
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Çıkış Yap
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    render={<Link href="/giris" />}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      transparent && "text-white hover:text-white hover:bg-white/10"
                    )}
                  >
                    Giriş Yap
                  </Button>
                  <Button render={<Link href="/kayit" />} size="sm">
                    Kayıt Ol
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
