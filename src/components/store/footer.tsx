import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { NewsletterForm } from "@/components/store/newsletter-form";
import { SITE_CONFIG, NAV_LINKS } from "@/constants";

export function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white relative" style={{ zIndex: 1 }}>
      {/* Desktop Footer */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-12 gap-8">
            {/* Brand */}
            <div className="col-span-4">
              <Link
                href="/"
                className="text-2xl font-bold text-white tracking-tight"
              >
                Poolemark
              </Link>
              <p className="text-sm text-white/50 mt-3 leading-relaxed max-w-sm">
                2018&apos;den bu yana Antalya&apos;dan tüm Türkiye&apos;ye ev gereçleri, dekorasyon ve yaşam ürünleri sunuyoruz. Kaliteli ürünler, hızlı kargo ve müşteri memnuniyeti odaklı hizmet anlayışımızla 10.000&apos;den fazla mutlu müşteriye ulaştık.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <SocialLink
                  href={SITE_CONFIG.socialMedia.instagram}
                  label="Instagram"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </SocialLink>
                <SocialLink
                  href={SITE_CONFIG.socialMedia.facebook}
                  label="Facebook"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </SocialLink>
                <SocialLink
                  href={SITE_CONFIG.socialMedia.twitter}
                  label="Twitter / X"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </SocialLink>
              </div>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Fırsatları Kaçırmayın</p>
                <p className="text-xs text-white/50 mt-1 mb-3">
                  Bültene katıl, yeni ürünleri ve kampanyaları ilk sen öğren.
                </p>
                <NewsletterForm />
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-span-2">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
                Keşfet
              </h4>
              <ul className="space-y-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies */}
            <div className="col-span-3">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
                Bilgilendirme
              </h4>
              <ul className="space-y-3">
                {[
                  { href: "/siparis-takip", label: "Sipariş Takibi" },
                  {
                    href: "/pages/kvkk-aydinlatma-metni",
                    label: "KVKK Aydınlatma Metni",
                  },
                  {
                    href: "/pages/gizlilik-politikasi",
                    label: "Gizlilik Politikası",
                  },
                  {
                    href: "/pages/cerez-politikasi",
                    label: "Çerez Politikası",
                  },
                  {
                    href: "/pages/mesafeli-satis-sozlesmesi",
                    label: "Mesafeli Satış Sözleşmesi",
                  },
                  {
                    href: "/pages/iade-degisim",
                    label: "İade ve Değişim",
                  },
                  {
                    href: "/pages/kargo-teslimat",
                    label: "Kargo ve Teslimat",
                  },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-3">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
                İletişim
              </h4>
              <ul className="space-y-3.5">
                <li className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 shrink-0">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <a
                    href={`tel:${SITE_CONFIG.phoneRaw}`}
                    className="text-sm text-white/50 hover:text-primary transition-colors pt-1"
                  >
                    {SITE_CONFIG.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 shrink-0">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <a
                    href={`mailto:${SITE_CONFIG.email}`}
                    className="text-sm text-white/50 hover:text-primary transition-colors pt-1"
                  >
                    {SITE_CONFIG.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-white/50 pt-1">
                    {SITE_CONFIG.address}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 shrink-0">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-white/50 pt-1">
                    {SITE_CONFIG.workingHours}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="lg:hidden container mx-auto px-4 py-8 pb-24 space-y-6">
        <div className="text-center">
          <Link
            href="/"
            className="text-xl font-bold text-white tracking-tight"
          >
            Poolemark
          </Link>
          <p className="text-xs text-white/40 mt-1 max-w-xs mx-auto">
            Antalya&apos;dan tüm Türkiye&apos;ye ev gereçleri ve dekorasyon. 10.000+ mutlu müşteri.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-white/50">
          <Link
            href="/pages/kvkk-aydinlatma-metni"
            className="hover:text-primary transition-colors"
          >
            KVKK
          </Link>
          <Link
            href="/pages/gizlilik-politikasi"
            className="hover:text-primary transition-colors"
          >
            Gizlilik
          </Link>
          <Link
            href="/pages/cerez-politikasi"
            className="hover:text-primary transition-colors"
          >
            Çerezler
          </Link>
          <Link
            href="/pages/iade-degisim"
            className="hover:text-primary transition-colors"
          >
            İade
          </Link>
          <Link
            href="/pages/kargo-teslimat"
            className="hover:text-primary transition-colors"
          >
            Kargo
          </Link>
        </div>
        <div className="text-center space-y-1 text-xs text-white/40">
          <p>
            <a
              href={`tel:${SITE_CONFIG.phoneRaw}`}
              className="hover:text-primary"
            >
              {SITE_CONFIG.phone}
            </a>
            {" · "}
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="hover:text-primary"
            >
              {SITE_CONFIG.email}
            </a>
          </p>
          <p>{SITE_CONFIG.address}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/payment-methods/footer-bilgi.png"
            alt="Güvenli ödeme yöntemleri"
            width={665}
            height={42}
            loading="lazy"
            decoding="async"
            className="h-7 w-auto object-contain opacity-70 mx-auto mt-3"
          />
          <p className="pt-2">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.companyName}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white text-center">Bültene Katıl</p>
          <p className="text-xs text-white/50 text-center mt-1 mb-3">
            Kampanyaları ilk öğrenen sen ol.
          </p>
          <NewsletterForm />
        </div>
      </div>

      {/* Bottom Bar - Desktop */}
      <Separator className="hidden lg:block bg-white/10" />
      <div className="hidden lg:block container mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>
            &copy; {new Date().getFullYear()} {SITE_CONFIG.companyName}. Tüm
            hakları saklıdır.
          </p>
          {/* Ödeme Logoları */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/payment-methods/footer-bilgi.png"
            alt="Güvenli ödeme yöntemleri"
            width={665}
            height={48}
            loading="lazy"
            decoding="async"
            className="h-8 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
          />
          <div className="flex items-center gap-1 text-white/30">
            <span>{SITE_CONFIG.taxOffice}</span>
            <span>·</span>
            <span>VKN: {SITE_CONFIG.taxNumber}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-white/60 hover:bg-primary/20 hover:text-primary transition-all"
    >
      {children}
    </a>
  );
}
