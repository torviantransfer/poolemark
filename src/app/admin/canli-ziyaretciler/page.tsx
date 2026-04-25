"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Eye,
  Users,
  UserCheck,
  MapPin,
  Sparkles,
  Repeat,
  Flame,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  DollarSign,
} from "lucide-react";

type FunnelStage = "browsing" | "product" | "cart" | "checkout" | "payment" | "thankyou";

type PresenceEntry = {
  key: string;
  path?: string;
  userId?: string | null;
  role?: string;
  joinedAt?: string;
  isReturning?: boolean;
  city?: string;
  country?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referrerHost?: string;
  lastAction?: string;
  cartCount?: number;
  cartValue?: number;
  stage?: FunnelStage;
};

export default function AdminLiveVisitorsPage() {
  const [entries, setEntries] = useState<PresenceEntry[]>([]);
  const [liveOps, setLiveOps] = useState<{
    summary: {
      visitors: number;
      addToCart: number;
      initiateCheckout: number;
      purchases: number;
      revenue: number;
      conversionRate: number;
    };
    sources: Array<{
      source: string;
      visitors: number;
      purchases: number;
      revenue: number;
      conversionRate: number;
    }>;
  } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Saniyede bir tick — "3 dk" gibi yaş hesapları için.
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 5000);
    return () => window.clearInterval(t);
  }, []);

  // Son 30 dk istatistiklerini periyodik fetch et.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/live-ops", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setLiveOps(data);
      } catch {
        // silent
      }
    };
    load();
    const t = window.setInterval(load, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("online-visitors", {
      config: { presence: { key: `admin-view-${crypto.randomUUID()}` } },
    });

    const readPresence = () => {
      const state = channel.presenceState<PresenceEntry>();
      const deduped = Object.entries(state).map(([presenceKey, rawList]) => {
        const anyList = rawList as Array<{
          path?: string;
          userId?: string | null;
          role?: string;
          joinedAt?: string;
          source?: string;
          medium?: string;
          campaign?: string;
          referrerHost?: string;
          lastAction?: string;
          metas?: Array<{
            path?: string;
            userId?: string | null;
            role?: string;
            joinedAt?: string;
            source?: string;
            medium?: string;
            campaign?: string;
            referrerHost?: string;
            lastAction?: string;
          }>;
        }>;

        const latestItem = anyList[anyList.length - 1] || {};
        const latestMeta = latestItem.metas?.[latestItem.metas.length - 1];

        return {
          key: presenceKey,
          path: latestMeta?.path ?? latestItem.path,
          userId: latestMeta?.userId ?? latestItem.userId ?? null,
          role: latestMeta?.role ?? latestItem.role,
          joinedAt: latestMeta?.joinedAt ?? latestItem.joinedAt,
          isReturning:
            (latestMeta as { isReturning?: boolean } | undefined)?.isReturning ??
            (latestItem as { isReturning?: boolean }).isReturning ??
            false,
          city: (latestMeta as { city?: string } | undefined)?.city ?? (latestItem as { city?: string }).city,
          country: (latestMeta as { country?: string } | undefined)?.country ?? (latestItem as { country?: string }).country,
          source: latestMeta?.source ?? latestItem.source,
          medium: latestMeta?.medium ?? latestItem.medium,
          campaign: latestMeta?.campaign ?? latestItem.campaign,
          referrerHost: latestMeta?.referrerHost ?? latestItem.referrerHost,
          lastAction: latestMeta?.lastAction ?? latestItem.lastAction,
          cartCount:
            (latestMeta as { cartCount?: number } | undefined)?.cartCount ??
            (latestItem as { cartCount?: number }).cartCount ??
            0,
          cartValue:
            (latestMeta as { cartValue?: number } | undefined)?.cartValue ??
            (latestItem as { cartValue?: number }).cartValue ??
            0,
          stage:
            ((latestMeta as { stage?: FunnelStage } | undefined)?.stage ??
              (latestItem as { stage?: FunnelStage }).stage) as FunnelStage | undefined,
        } satisfies PresenceEntry;
      });

      // Admin gözlemci kaydını gerçek ziyaretçi sayımına katma.
      const visitorsOnly = deduped.filter((e) => e.role !== "admin-live-visitors");
      setEntries(visitorsOnly);
    };

    channel.on("presence", { event: "sync" }, readPresence);
    channel.on("presence", { event: "join" }, readPresence);
    channel.on("presence", { event: "leave" }, readPresence);

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ role: "admin-live-visitors" });
        readPresence();
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const pageStats = useMemo(() => {
    return entries.reduce<Record<string, number>>((acc, item) => {
      const key = item.path || "(bilinmiyor)";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [entries]);

  const memberCount = entries.filter((e) => Boolean(e.userId)).length;
  const guestCount = Math.max(entries.length - memberCount, 0);
  // Üye olarak giriş yapan kişi tanım gereği geri dönen sayılır (sistemde kayıtlı).
  // Misafirler için localStorage flag'i kullanılır.
  const returningCount = entries.filter((e) => Boolean(e.userId) || e.isReturning).length;
  const newCount = Math.max(entries.length - returningCount, 0);
  const sourceStats = useMemo(() => {
    return entries.reduce<Record<string, number>>((acc, item) => {
      const key = item.source || "direct";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [entries]);

  // === SICAK KİŞİLER ===
  // Sepetinde ürün olan VEYA checkout sayfasında olan ziyaretçiler.
  // Sıra: önce checkout > cart > en yüksek sepet değeri.
  const hotVisitors = useMemo(() => {
    const stagePriority: Record<string, number> = {
      checkout: 4,
      payment: 4,
      cart: 3,
      product: 2,
      browsing: 1,
      thankyou: 0,
    };
    return entries
      .filter((e) => (e.cartCount && e.cartCount > 0) || e.stage === "checkout" || e.stage === "payment")
      .sort((a, b) => {
        const sa = stagePriority[a.stage || "browsing"] || 0;
        const sb = stagePriority[b.stage || "browsing"] || 0;
        if (sb !== sa) return sb - sa;
        return (b.cartValue || 0) - (a.cartValue || 0);
      })
      .slice(0, 10);
  }, [entries]);

  const cartCarriers = entries.filter((e) => (e.cartCount || 0) > 0).length;
  const checkoutNow = entries.filter((e) => e.stage === "checkout" || e.stage === "payment").length;
  const totalCartValueNow = entries.reduce((sum, e) => sum + (e.cartValue || 0), 0);

  function ageMinutes(joinedAtISO: string | undefined): number {
    if (!joinedAtISO) return 0;
    const t = new Date(joinedAtISO).getTime();
    if (!Number.isFinite(t)) return 0;
    return Math.max(0, Math.round((now - t) / 60000));
  }

  function fmtTL(value: number): string {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function stageLabel(stage: FunnelStage | undefined): { label: string; color: string } {
    switch (stage) {
      case "payment":
        return { label: "Ödeme", color: "bg-rose-100 text-rose-800" };
      case "checkout":
        return { label: "Checkout", color: "bg-orange-100 text-orange-800" };
      case "cart":
        return { label: "Sepet", color: "bg-amber-100 text-amber-800" };
      case "product":
        return { label: "Ürün", color: "bg-blue-100 text-blue-800" };
      case "thankyou":
        return { label: "Teşekkürler", color: "bg-emerald-100 text-emerald-800" };
      default:
        return { label: "Geziniyor", color: "bg-gray-100 text-gray-700" };
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Canlı Ziyaretçiler</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Anlık aktif ziyaretçi dağılımı Realtime Presence üzerinden izlenir.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={Eye} label="Toplam Aktif" value={entries.length} />
        <StatCard icon={UserCheck} label="Üye" value={memberCount} />
        <StatCard icon={Users} label="Misafir" value={guestCount} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard icon={Sparkles} label="Yeni Ziyaretçi" value={newCount} />
        <StatCard icon={Repeat} label="Geri Dönen" value={returningCount} />
      </div>

      {/* === ŞIMDI: sepet/checkout pipeline === */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={ShoppingCart} label="Sepetli" value={cartCarriers} accent="amber" />
        <StatCard icon={CreditCard} label="Checkout'ta" value={checkoutNow} accent="orange" />
        <StatCard
          icon={DollarSign}
          label="Sepetlerde Toplam"
          value={fmtTL(totalCartValueNow)}
          accent="emerald"
        />
      </div>

      {/* === SON 30 DK: site_events tabanlı huni === */}
      <div className="bg-white border rounded-2xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Son 30 Dakika
          </h2>
          <span className="text-[11px] text-muted-foreground">30 sn'de bir günceller</span>
        </div>
        {!liveOps ? (
          <p className="text-sm text-muted-foreground">Yükleniyor…</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <MiniStat label="Ziyaretçi" value={liveOps.summary.visitors} />
            <MiniStat label="Sepete Ekleme" value={liveOps.summary.addToCart} />
            <MiniStat label="Checkout" value={liveOps.summary.initiateCheckout} />
            <MiniStat label="Satış" value={liveOps.summary.purchases} />
            <MiniStat
              label={`Dönüşüm (₺${Math.round(liveOps.summary.revenue).toLocaleString("tr-TR")})`}
              value={`%${liveOps.summary.conversionRate}`}
              highlight
            />
          </div>
        )}
      </div>

      {/* === SICAK KİŞİLER === */}
      <div className="bg-white border rounded-2xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Sıcak Kişiler
            <span className="text-xs font-normal text-muted-foreground">
              (sepetli veya checkout'ta)
            </span>
          </h2>
        </div>
        {hotVisitors.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Şu an sepetinde ürün olan veya ödeme adımındaki ziyaretçi yok.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2 pr-4 font-medium">Aşama</th>
                  <th className="text-left py-2 pr-4 font-medium">Tür</th>
                  <th className="text-left py-2 pr-4 font-medium">Şehir</th>
                  <th className="text-left py-2 pr-4 font-medium">Sepet</th>
                  <th className="text-left py-2 pr-4 font-medium">Süre</th>
                  <th className="text-left py-2 font-medium">Kaynak</th>
                </tr>
              </thead>
              <tbody>
                {hotVisitors.map((entry) => {
                  const sl = stageLabel(entry.stage);
                  return (
                    <tr key={entry.key} className="border-b last:border-0 hover:bg-orange-50/40">
                      <td className="py-2 pr-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit ${sl.color}`}>
                          {sl.label}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit ${entry.userId ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {entry.userId ? "Üye" : "Misafir"}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        {entry.city ? (
                          <span className="inline-flex items-center gap-1 text-xs text-foreground">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {entry.city}
                            {entry.country && entry.country !== "Türkiye" ? ` (${entry.country})` : ""}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        <div className="text-xs">
                          <div className="font-semibold text-foreground">{fmtTL(entry.cartValue || 0)}</div>
                          <div className="text-muted-foreground">{entry.cartCount || 0} ürün</div>
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-xs text-muted-foreground">
                        {ageMinutes(entry.joinedAt)} dk
                      </td>
                      <td className="py-2 text-xs text-foreground">
                        <div className="font-medium">{entry.source || "direct"}</div>
                        <div className="text-muted-foreground">{entry.medium || "none"}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* === KAYNAK PERFORMANSI (30 dk) === */}
      <div className="bg-white border rounded-2xl p-4 md:p-5">
        <h2 className="font-semibold mb-3">Kaynak Performansı (Son 30 dk)</h2>
        {!liveOps || liveOps.sources.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz veri yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2 pr-4 font-medium">Kaynak</th>
                  <th className="text-right py-2 pr-4 font-medium">Ziyaretçi</th>
                  <th className="text-right py-2 pr-4 font-medium">Satış</th>
                  <th className="text-right py-2 pr-4 font-medium">Dönüşüm</th>
                  <th className="text-right py-2 font-medium">Ciro</th>
                </tr>
              </thead>
              <tbody>
                {liveOps.sources.map((s) => {
                  const lowConv = s.visitors >= 10 && s.conversionRate < 1;
                  return (
                    <tr key={s.source} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-xs text-foreground">{s.source}</td>
                      <td className="py-2 pr-4 text-xs text-foreground text-right">{s.visitors}</td>
                      <td className="py-2 pr-4 text-xs text-foreground text-right">{s.purchases}</td>
                      <td className={`py-2 pr-4 text-xs text-right ${lowConv ? "text-rose-600 font-semibold" : "text-foreground"}`}>
                        %{s.conversionRate}
                        {lowConv ? " ⚠️" : ""}
                      </td>
                      <td className="py-2 text-xs text-foreground text-right">{fmtTL(s.revenue)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white border rounded-2xl p-4 md:p-5">
        <h2 className="font-semibold mb-3">Sayfa Bazlı Dağılım</h2>
        <div className="space-y-2">
          {Object.keys(pageStats).length === 0 && (
            <p className="text-sm text-muted-foreground">Henüz aktif ziyaretçi yok.</p>
          )}
          {Object.entries(pageStats)
            .sort((a, b) => b[1] - a[1])
            .map(([path, count]) => (
              <div key={path} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span className="text-sm text-foreground truncate pr-3">{path}</span>
                <span className="text-xs font-semibold text-primary">{count}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-4 md:p-5">
        <h2 className="font-semibold mb-3">Kaynak Bazlı Dağılım</h2>
        <div className="space-y-2">
          {Object.keys(sourceStats).length === 0 && (
            <p className="text-sm text-muted-foreground">Henüz aktif ziyaretçi yok.</p>
          )}
          {Object.entries(sourceStats)
            .sort((a, b) => b[1] - a[1])
            .map(([source, count]) => (
              <div key={source} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span className="text-sm text-foreground truncate pr-3">{source}</span>
                <span className="text-xs font-semibold text-primary">{count}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-4 md:p-5">
        <h2 className="font-semibold mb-3">Ziyaretçi Listesi</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-xs">
                <th className="text-left py-2 pr-4 font-medium">Tür</th>
                <th className="text-left py-2 pr-4 font-medium">Kaynak</th>
                <th className="text-left py-2 pr-4 font-medium">Şehir</th>
                <th className="text-left py-2 pr-4 font-medium">Sayfa</th>
                <th className="text-left py-2 pr-4 font-medium">Son Aksiyon</th>
                <th className="text-left py-2 font-medium">Katılma</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-muted-foreground">
                    Henüz aktif ziyaretçi yok.
                  </td>
                </tr>
              )}
              {entries.map((entry) => (
                <tr key={entry.key} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-2 pr-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit ${entry.userId ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {entry.userId ? "Üye" : "Misafir"}
                      </span>
                      {!entry.userId && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full w-fit ${entry.isReturning ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                          {entry.isReturning ? "Geri Dönen" : "Yeni"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="text-xs text-foreground">
                      <div className="font-medium">{entry.source || "direct"}</div>
                      <div className="text-muted-foreground">{entry.medium || "none"}</div>
                    </div>
                  </td>
                  <td className="py-2 pr-4">
                    {entry.city ? (
                      <span className="inline-flex items-center gap-1 text-xs text-foreground">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {entry.city}
                        {entry.country && entry.country !== "Türkiye" ? ` (${entry.country})` : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    <span className="text-xs text-foreground truncate max-w-[200px] block">{entry.path || "—"}</span>
                  </td>
                  <td className="py-2 pr-4">
                    <span className="text-xs text-foreground truncate max-w-[220px] block">{entry.lastAction || "—"}</span>
                  </td>
                  <td className="py-2 text-xs text-muted-foreground">
                    {entry.joinedAt ? new Date(entry.joinedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  accent?: "amber" | "orange" | "emerald" | "rose";
}) {
  const accentClasses: Record<string, string> = {
    amber: "border-amber-200 bg-amber-50/40",
    orange: "border-orange-200 bg-orange-50/40",
    emerald: "border-emerald-200 bg-emerald-50/40",
    rose: "border-rose-200 bg-rose-50/40",
  };
  const iconAccent: Record<string, string> = {
    amber: "text-amber-600",
    orange: "text-orange-600",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
  };
  return (
    <div className={`bg-white border rounded-2xl p-4 ${accent ? accentClasses[accent] : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className={`h-4 w-4 ${accent ? iconAccent[accent] : "text-primary"}`} />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        highlight ? "border-emerald-300 bg-emerald-50/60" : "border-border bg-muted/30"
      }`}
    >
      <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
      <p
        className={`text-lg font-semibold mt-0.5 ${
          highlight ? "text-emerald-700" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
