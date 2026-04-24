import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left: Branding Panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white p-12 flex-col justify-between overflow-hidden">
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center hover:opacity-90 transition-opacity"
          >
            <Image
              src="/logo.png"
              alt="Poolemark"
              width={200}
              height={52}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <p className="text-white/60 text-sm mt-1">
            Yapışkanlı Duvar Paneli & Folyo
          </p>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Duvarlarınıza yeni bir hayat verin
          </h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            PVC duvar paneli, 3D tuğla panel ve mermer desenli folyo ile
            evinizi kırmadan dökmeden yenileyin. 2018&apos;den bu yana binlerce mutlu müşteri.
          </p>
          <div className="flex items-center gap-8 mt-8">
            <div>
              <p className="text-2xl font-bold">5.000+</p>
              <p className="text-xs text-white/50 mt-0.5">Mutlu Müşteri</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <p className="text-2xl font-bold">4.9/5</p>
              <p className="text-xs text-white/50 mt-0.5">Müşteri Puanı</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <p className="text-2xl font-bold">81 İl</p>
              <p className="text-xs text-white/50 mt-0.5">Kargo</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/30">
          &copy; {new Date().getFullYear()} Poolemark. Tüm hakları saklıdır.
        </p>

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 right-12 w-48 h-48 bg-white/5 rounded-full" />
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden p-6 pb-0 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center"
          >
            <Image
              src="/logo.png"
              alt="Poolemark"
              width={155}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Siteye Dön
          </Link>
        </div>

        {/* Desktop back link */}
        <div className="hidden lg:block p-6 pb-0 text-right">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Siteye Dön
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
