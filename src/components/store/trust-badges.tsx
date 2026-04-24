import { Truck, CreditCard, RotateCcw, Package } from "lucide-react";

const badges = [
  {
    icon: Truck,
    label: "Ücretsiz Kargo",
    desc: "500₺ üzeri siparişlerde",
  },
  {
    icon: CreditCard,
    label: "12 Taksit İmkanı",
    desc: "Kredi kartına vade farksız",
  },
  {
    icon: RotateCcw,
    label: "Ücretsiz İade",
    desc: "14 gün içinde ücretsiz iade",
  },
  {
    icon: Package,
    label: "Hızlı Teslimat",
    desc: "Bölgeye göre 2-7 iş günü",
  },
];

export function TrustBadges() {
  return (
    <section className="py-4 md:py-5 bg-white border-b border-border/30" aria-label="Avantajlar">
      {/* Desktop: flex row */}
      <div className="hidden md:block container mx-auto px-4">
        <div className="flex items-center justify-between">
          {badges.map((item, i) => (
            <div key={item.label} className="flex items-center">
              <div className="flex items-center gap-3 px-4">
                <item.icon className="h-6 w-6 text-primary shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-base font-semibold text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              {i < 3 && <div className="w-px h-10 bg-border/50 ml-4" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: CSS marquee (no JS layout thrash) */}
      <div className="md:hidden overflow-hidden" aria-label="Avantajlar">
        <div className="flex min-w-max animate-trust-marquee motion-reduce:animate-none">
          {[...badges, ...badges].map((item, i) => (
            <div key={`${item.label}-${i}`} className="flex items-center gap-3 px-5 shrink-0">
              <item.icon className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
              <div className="whitespace-nowrap">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
