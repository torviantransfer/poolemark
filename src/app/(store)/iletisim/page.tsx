import { SITE_CONFIG } from "@/constants";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Building2,
  FileText,
} from "lucide-react";
import { ContactForm } from "@/components/store/contact-form";
import { BreadcrumbJsonLd } from "@/components/shared/json-ld";
import type { Metadata } from "next";

const BASE_URL = "https://poolemark.com";

export const metadata: Metadata = {
  title: "İletişim | Poolemark",
  description:
    "Poolemark ile iletişime geçin. Telefon, e-posta veya iletişim formu aracılığıyla sorularınızı iletin.",
  alternates: { canonical: `${BASE_URL}/iletisim` },
  openGraph: {
    type: "website",
    title: "İletişim | Poolemark",
    description:
      "Poolemark ile iletişime geçin. Telefon, e-posta veya iletişim formu aracılığıyla sorularınızı iletin.",
    url: `${BASE_URL}/iletisim`,
    siteName: "Poolemark",
    locale: "tr_TR",
    images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: "Poolemark İletişim" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "İletişim | Poolemark",
    description:
      "Poolemark ile iletişime geçin. Telefon, e-posta veya iletişim formu aracılığıyla sorularınızı iletin.",
    images: [`${BASE_URL}/og-image.png`],
  },
};

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Phone,
      title: "Telefon",
      value: SITE_CONFIG.phone,
      href: `tel:${SITE_CONFIG.phoneRaw}`,
      desc: "Hafta içi 09:00-18:00",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Mail,
      title: "E-posta",
      value: SITE_CONFIG.email,
      href: `mailto:${SITE_CONFIG.email}`,
      desc: "24 saat içinde yanıt",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: "Hızlı Mesaj",
      href: `https://wa.me/${SITE_CONFIG.whatsapp}`,
      desc: "Anında iletişim",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: MapPin,
      title: "Adres",
      value: SITE_CONFIG.address,
      href: `https://maps.google.com/?q=${encodeURIComponent(SITE_CONFIG.address)}`,
      desc: SITE_CONFIG.city,
      color: "bg-primary/10 text-primary",
    },
  ];

  return (
    <div>
      <BreadcrumbJsonLd items={[{ name: "Anasayfa", href: "/" }, { name: "İletişim", href: "/iletisim" }]} />
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 via-primary/3 to-white border-b border-border/30">
        <div className="container mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6">
              <MessageCircle className="h-4 w-4" />
              <span>Size yardımcı olmaktan mutluluk duyarız</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Bize{" "}
              <span className="text-primary">Ulaşın</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Sorularınız, önerileriniz veya talepleriniz için bize her zaman
              ulaşabilirsiniz.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.href}
                target={method.title === "WhatsApp" ? "_blank" : undefined}
                rel={
                  method.title === "WhatsApp"
                    ? "noopener noreferrer"
                    : undefined
                }
                className="group p-5 rounded-2xl bg-white border border-border/30 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${method.color} mb-3`}
                >
                  <method.icon className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {method.title}
                </p>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {method.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {method.desc}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="bg-white">
        <div className="container mx-auto px-4 pb-8">
          <div className="rounded-2xl overflow-hidden border border-border/30 shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3190.8!2d30.7!3d36.88!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDUyJzQ4LjAiTiAzMMKwNDInMDAuMCJF!5e0!3m2!1str!2str!4v1"
              width="100%"
              height="320"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Poolemark Konum - Sedir Mahallesi, Muratpaşa / Antalya"
            />
          </div>
        </div>
      </section>

      {/* Company Info + Form */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
            {/* Left: Company & Working Hours */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company Info */}
              <div className="p-6 rounded-2xl border border-border/30 bg-secondary/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Firma Bilgileri
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="text-muted-foreground">
                      {SITE_CONFIG.companyName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="text-muted-foreground">
                      {SITE_CONFIG.taxOffice}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="text-muted-foreground">
                      VKN: {SITE_CONFIG.taxNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="text-muted-foreground">
                      {SITE_CONFIG.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="p-6 rounded-2xl border border-border/30 bg-secondary/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Çalışma Saatleri
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pazartesi - Cuma</span>
                    <span className="font-medium text-foreground">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cumartesi</span>
                    <span className="font-medium text-foreground">09:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pazar</span>
                    <span className="font-medium text-destructive">Kapalı</span>
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="p-6 rounded-2xl border border-border/30 bg-secondary/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Hızlı İletişim
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                    <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {SITE_CONFIG.phone}
                  </a>
                  <a href={`mailto:${SITE_CONFIG.email}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {SITE_CONFIG.email}
                  </a>
                  <a href={`https://wa.me/${SITE_CONFIG.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    WhatsApp ile Mesaj
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
