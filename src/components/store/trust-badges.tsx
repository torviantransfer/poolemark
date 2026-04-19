"use client";

import { useEffect, useRef } from "react";
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
    label: "1-2 İş Günü Teslimat",
    desc: "Hızlı ve güvenli kargo",
  },
];

export function TrustBadges() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Only auto-scroll on mobile (< 768px)
    const mq = window.matchMedia("(max-width: 767px)");
    if (!mq.matches) return;

    let animId: number;
    let paused = false;
    let pos = 0;
    const speed = 0.5; // px per frame

    function step() {
      if (!el || paused) {
        animId = requestAnimationFrame(step);
        return;
      }
      pos += speed;
      // scrollWidth / 2 because we duplicate the items
      const half = el.scrollWidth / 2;
      if (pos >= half) pos = 0;
      el.scrollLeft = pos;
      animId = requestAnimationFrame(step);
    }

    // Pause on touch
    const pause = () => { paused = true; };
    const resume = () => { 
      paused = false; 
      pos = el.scrollLeft;
    };
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume, { passive: true });

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, []);

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

      {/* Mobile: horizontal auto-scroll marquee */}
      <div
        ref={scrollRef}
        className="md:hidden flex overflow-x-auto scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}
        role="marquee"
        aria-label="Avantajlar"
      >
        {/* Duplicate for seamless loop */}
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
    </section>
  );
}
