import { SITE_CONFIG } from "@/constants";
import {
  Target,
  Heart,
  Award,
  Users,
  Package,
  Truck,
  ThumbsUp,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Globe,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkımızda | Poolemark",
  description:
    "Poolemark, 2018'den bu yana ev gereçleri ve dekorasyon alanında güvenilir hizmet sunan bir markadır.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 via-primary/3 to-white border-b border-border/30">
        <div className="container mx-auto px-4 pt-10 pb-12 md:pt-14 md:pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6">
              <Calendar className="h-4 w-4" />
              <span>2018&apos;den bu yana</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              Evinize Değer Katan{" "}
              <span className="text-primary">Marka</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Poolemark olarak, yaşam alanlarınızı güzelleştirecek kaliteli ve
              şık ürünleri uygun fiyatlarla sunuyoruz.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                Hikayemiz
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-6">
                Küçük Bir Adımla
                <br />
                Büyük Bir Yolculuk
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  2018 yılında Antalya&apos;da küçük bir depo ile başlayan
                  hikayemiz, bugün binlerce müşteriye ulaşan bir markaya
                  dönüştü. Her geçen gün büyüyen ürün yelpazemiz ve artan
                  müşteri memnuniyetimizle yolumuza devam ediyoruz.
                </p>
                <p>
                  Ev gereçleri ve dekorasyon sektöründe, kaliteli ürünleri
                  herkesin erişebileceği fiyatlarla sunmayı ilke edindik. Her
                  ürünümüz, yaşam alanlarınıza değer katmak için özenle
                  seçilmektedir.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  value: "2018",
                  label: "Kuruluş Yılı",
                  icon: Calendar,
                  color: "bg-primary/10 text-primary",
                },
                {
                  value: "5000+",
                  label: "Mutlu Müşteri",
                  icon: Users,
                  color: "bg-primary/10 text-primary",
                },
                {
                  value: "1500+",
                  label: "Ürün Çeşidi",
                  icon: Package,
                  color: "bg-primary/10 text-primary",
                },
                {
                  value: "%98",
                  label: "Memnuniyet",
                  icon: ThumbsUp,
                  color: "bg-primary/10 text-primary",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 rounded-2xl border border-border/30 bg-secondary/30 text-center hover:shadow-md transition-shadow"
                >
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.color} mb-3`}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              Değerlerimiz
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Bizi Biz Yapan İlkeler
            </h2>
            <p className="text-muted-foreground">
              Her kararımızda bu değerleri pusula olarak kullanıyoruz.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Müşteri Odaklılık",
                desc: "Tüm süreçlerimizi müşterilerimizin ihtiyaçlarına göre şekillendiriyoruz. Sizin memnuniyetiniz, bizim başarımız.",
                iconBg: "bg-primary/10",
                iconColor: "text-primary",
              },
              {
                icon: Award,
                title: "Kalitede Taviz Yok",
                desc: "Sunduğumuz her ürün, sıkı kalite kontrollerinden geçer. Standartlarımızdan asla ödün vermeyiz.",
                iconBg: "bg-primary/10",
                iconColor: "text-primary",
              },
              {
                icon: Heart,
                title: "Tutkuyla Çalışıyoruz",
                desc: "İşimizi seviyoruz ve bu tutku her detayda kendini gösteriyor. Evinize değer katmak için çabalıyoruz.",
                iconBg: "bg-primary/10",
                iconColor: "text-primary",
              },
              {
                icon: Shield,
                title: "Güvenilirlik",
                desc: "Şeffaf iletişim, zamanında teslimat ve dürüst ticaret anlayışıyla güveninizi kazanıyoruz.",
                iconBg: "bg-primary/10",
                iconColor: "text-primary",
              },
              {
                icon: TrendingUp,
                title: "Sürekli Gelişim",
                desc: "Trendleri takip ediyor, geri bildirimlerinizi dinliyor ve kendimizi sürekli geliştiriyoruz.",
                iconBg: "bg-primary/10",
                iconColor: "text-primary",
              },
              {
                icon: Globe,
                title: "Erişilebilirlik",
                desc: "Kaliteli ürünleri herkesin erişebileceği fiyatlarla sunarak ev dekorasyonunu demokratikleştiriyoruz.",
                iconBg: "bg-primary/10",
                iconColor: "text-primary",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`p-6 md:p-8 rounded-2xl border border-border/30 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${item.iconBg} mb-5`}
                >
                  <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline / Journey */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              Yol Haritamız
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Yolculuğumuzun Önemli Adımları
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-0">
            {[
              {
                year: "2018",
                title: "Kuruluş",
                desc: "Antalya'da küçük bir depodan ilk adımımızı attık. Ev gereçleri alanında kaliteli ürünler sunma hayalimize başladık.",
              },
              {
                year: "2019",
                title: "İlk Büyüme",
                desc: "Ürün yelpazemizi genişlettik ve müşteri tabanımızı büyüttük. Online satışlara yoğunlaştık.",
              },
              {
                year: "2021",
                title: "Dijital Dönüşüm",
                desc: "E-ticaret altyapımızı güçlendirdik. Müşterilerimize daha hızlı ve güvenli alışveriş deneyimi sunmaya başladık.",
              },
              {
                year: "2023",
                title: "Marka Büyümesi",
                desc: "Dekorasyon ürünlerini de portföyümüze ekledik. Türkiye genelinde binlerce müşteriye ulaştık.",
              },
              {
                year: "2025",
                title: "Yeni Dönem",
                desc: "Yenilenen web sitemiz ve genişleyen ürün gamımızla, evinize değer katmaya devam ediyoruz.",
              },
            ].map((step, i) => (
              <div key={step.year} className="relative flex gap-6 md:gap-8">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white text-sm font-bold shrink-0 z-10">
                    {step.year.slice(2)}
                  </div>
                  {i < 4 && (
                    <div className="w-0.5 h-full bg-primary/20 min-h-[60px]" />
                  )}
                </div>
                <div className="pb-10">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {step.year}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground mt-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Bizimle Tanışın
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Sorularınız mı var? Bize ulaşın, sizinle tanışmak isteriz.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                render={<Link href="/iletisim" />}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 h-12 px-8 text-base font-semibold"
              >
                <Mail className="mr-2 h-5 w-5" />
                İletişime Geçin
              </Button>
              <Button
                render={<Link href="/products" />}
                variant="outline"
                size="lg"
                className="border-white/40 text-white hover:bg-white/10 hover:text-white h-12 px-8 text-base"
              >
                Ürünleri Keşfet
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Bar */}
      <section className="py-10 bg-secondary/50 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telefon</p>
                <a
                  href={`tel:${SITE_CONFIG.phoneRaw}`}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {SITE_CONFIG.phone}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">E-posta</p>
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {SITE_CONFIG.email}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Adres</p>
                <p className="text-sm font-medium text-foreground">
                  {SITE_CONFIG.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
