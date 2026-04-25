"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Eye,
  MapPin,
  Flame,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  ChevronDown,
  ChevronUp,
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

type LiveOpsData = {
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
};

type SourceTab = "now" | "last30";

export default function AdminLiveVisitorsPage() {
  const [entries, setEntries] = useState<PresenceEntry[]>([]);
  const [liveOps, setLiveOps] = useState<LiveOpsData | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [sourceTab, setSourceTab] = useState<SourceTab>("now");
  const [showDetails, setShowDetails] = useState(false);

  // Yaş hesabı için 5 sn'lik tick.
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
        const anyList = rawList as Array<Record<string, unknown> & { metas?: Array<Record<string, unknown>> }>;
        const latestItem = anyList[anyList.length - 1] || {};
        const latestMeta = (latestItem.metas?.[latestItem.metas.length - 1] as Record<string, unknown> | undefined) || {};
        const get = <T,>(key: string): T | undefined =>
          (latestMeta[key] as T | undefined) ?? (latestItem[key] as T | undefined);

        return {
          key: presenceKey,
          path: get<string>("path"),
          userId: get<string | null>("userId") ?? null,
          role: get<string>("role"),
          joinedAt: get<string>("joinedAt"),
          isReturning: get<boolean>("isReturning") ?? false,
          city: get<string>("city"),
          country: get<string>("country"),
          source: get<string>("source"),
          medium: get<string>("medium"),
          campaign: get<string>("campaign"),
          referrerHost: get<string>("referrerHost"),
          lastAction: get<string>("lastAction"),
          cartCount: get<number>("cartCount") ?? 0,
          cartValue: get<number>("cartValue") ?? 0,
          stage: get<FunnelStage>("stage"),
        } satisfies PresenceEntry;
      });

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

  // === Türetilmiş metrikler ===
  const memberCount = entries.filter((e) => Boolean(e.userId)).length;
  const guestCount = Math.max(entries.length - memberCount, 0);
  const returningCount = entries.filter((e) => Boolean(e.userId) || e.isReturning).length;
  const newCount = Math.max(entries.length - returningCount, 0);

  const cartCarriers = entries.filter((e) => (e.cartCount || 0) > 0).length;
  const checkoutNow = entries.filter((e) => e.stage === "checkout" || e.stage === "payment").length;
  const totalCartValueNow = entries.reduce((sum, e) => sum + (e.cartValue || 0), 0);

  const sourceStatsNow = useMemo(() => {
    return entries.reduce<Record<string, number>>((acc, item) => {
      const key = item.source || "direct";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [entries]);

  const pageStats = useMemo(() => {
    return entries.reduce<Record<string, number>>((acc, item) => {
      const key = item.path || "(bilinmiyor)";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [entries]);

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

  // === FUNNEL bar verileri ===
  const funnelSteps = liveOps
    ? [
        { key: "visitors", label: "Ziyaretçi", value: liveOps.summary.visitors, color: "bg-blue-500" },
        { key: "atc", label: "Sepete Ekleme", value: liveOps.summary.addToCart, color: "bg-amber-500" },
        { key: "checkout", label: "Checkout", value: liveOps.summary.initiateCheckout, color: "bg-orange-500" },
        { key: "purchase", label: "Satış", value: liveOps.summary.purchases, color: "bg-emerald-500" },
      ]
    : [];
  const funnelMax = Math.max(1, ...funnelSteps.map((s) => s.value));

  // === KAYNAK tablosu (tab'a göre veri kaynağı) ===
  const sourceRows = useMemo(() => {
    if (sourceTab === "now") {
      return Object.entries(sourceStatsNow)
        .sort((a, b) => b[1] - a[1])
        .map(([source, visitors]) => ({
          source,
          visitors,
          purchases: 0,
          revenue: 0,
          conversionRate: 0,
        }));
    }
    return liveOps?.sources ?? [];
  }, [sourceTab, sourceStatsNow, liveOps]);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Canlı Ziyaretçiler</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Anlık aktif ziyaretçi & son 30 dakika dönüşüm hunisi
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Canlı
          </span>
        </div>
      </div>

      {/* KPI — 4 kart */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Eye}
          label="Aktif Şu An"
          value={entries.length}
          tone="primary"
          sub={`${memberCount} üye · ${guestCount} misafir`}
        />
        <KpiCard
          icon={ShoppingCart}
          label="Sepetli"
          value={cartCarriers}
          tone="amber"
          sub={fmtTL(totalCartValueNow) + " toplam"}
        />
        <KpiCard
          icon={CreditCard}
          label="Checkout'ta"
          value={checkoutNow}
          tone="orange"
          sub="ödeme adımında"
        />
        <KpiCard
          icon={TrendingUp}
          label="Son 30dk Satış"
          value={liveOps?.summary.purchases ?? 0}
          tone="emerald"
          sub={liveOps ? fmtTL(liveOps.summary.revenue) + " ciro" : "yükleniyor…"}
        />
      </div>

      {/* CHIP STRIP — yeni / geri dönen */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Chip label={`${newCount} yeni ziyaretçi`} tone="emerald" />
        <Chip label={`${returningCount} geri dönen`} tone="amber" />
        {liveOps && (
          <Chip
            label={`%${liveOps.summary.conversionRate} dönüşüm (30dk)`}
            tone={liveOps.summary.conversionRate >= 1 ? "emerald" : "rose"}
          />
        )}
      </div>

      {/* FUNNEL BAR — son 30dk huni */}
      <div className="bg-white border rounded-2xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Dönüşüm Hunisi
            <span className="text-xs font-normal text-muted-foreground">(son 30 dk)</span>
          </h2>
          <span className="text-[11px] text-muted-foreground">30 sn'de bir günceller</span>
        </div>
        {!liveOps ? (
          <p className="text-sm text-muted-foreground">Yükleniyor…</p>
        ) : (
          <div className="space-y-2.5">
            {funnelSteps.map((step, idx) => {
              const widthPct = (step.value / funnelMax) * 100;
              const prev = idx > 0 ? funnelSteps[idx - 1].value : null;
              const dropPct = prev !== null && prev > 0 ? Math.round((step.value / prev) * 100) : null;
              const dropTone =
                dropPct === null ? "" : dropPct < 30 ? "text-rose-600" : dropPct < 60 ? "text-amber-600" : "text-emerald-600";
              return (
                <div key={step.key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">{step.label}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-foreground tabular-nums">{step.value}</span>
                      {dropPct !== null && (
                        <span className={`text-[11px] font-medium ${dropTone}`}>%{dropPct}</span>
                      )}
                    </span>
                  </div>
                  <div className="relative h-6 rounded-md bg-muted/40 overflow-hidden">
                    <div
                      className={`h-full ${step.color} transition-all duration-500`}
                      style={{ width: `${Math.max(widthPct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SICAK KİŞİLER */}
      <div className="bg-white border rounded-2xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Sıcak Kişiler
            <span className="text-xs font-normal text-muted-foreground">
              (sepetli veya ödeme adımında)
            </span>
          </h2>
          {hotVisitors.length > 0 && (
            <span className="text-xs text-muted-foreground">{hotVisitors.length} kişi</span>
          )}
        </div>
        {hotVisitors.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Şu an sepetinde ürün olan veya ödeme adımındaki ziyaretçi yok.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-4 md:-mx-5 px-4 md:px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2 pr-4 font-medium">Aşama</th>
                  <th className="text-left py-2 pr-4 font-medium">Tür</th>
                  <th className="text-left py-2 pr-4 font-medium">Şehir</th>
                  <th className="text-right py-2 pr-4 font-medium">Sepet</th>
                  <th className="text-right py-2 pr-4 font-medium">Süre</th>
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
                      <td className="py-2 pr-4 text-right">
                        <div className="text-xs">
                          <div className="font-semibold text-foreground tabular-nums">{fmtTL(entry.cartValue || 0)}</div>
                          <div className="text-muted-foreground">{entry.cartCount || 0} ürün</div>
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-right text-xs text-muted-foreground tabular-nums">
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

      {/* KAYNAK PERFORMANSI — tab'lı */}
      <div className="bg-white border rounded-2xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-semibold">Kaynak Performansı</h2>
          <div className="inline-flex rounded-lg border bg-muted/30 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setSourceTab("now")}
              className={`px-3 py-1 rounded-md transition ${sourceTab === "now" ? "bg-white shadow-sm font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Anlık
            </button>
            <button
              type="button"
              onClick={() => setSourceTab("last30")}
              className={`px-3 py-1 rounded-md transition ${sourceTab === "last30" ? "bg-white shadow-sm font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Son 30 dk
            </button>
          </div>
        </div>
        {sourceRows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Henüz veri yok.</p>
        ) : (
          <div className="overflow-x-auto -mx-4 md:-mx-5 px-4 md:px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2 pr-4 font-medium">Kaynak</th>
                  <th className="text-right py-2 pr-4 font-medium">Ziyaretçi</th>
                  {sourceTab === "last30" && (
                    <>
                      <th className="text-right py-2 pr-4 font-medium">Satış</th>
                      <th className="text-right py-2 pr-4 font-medium">Dönüşüm</th>
                      <th className="text-right py-2 font-medium">Ciro</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {sourceRows.map((s) => {
                  const lowConv = sourceTab === "last30" && s.visitors >= 10 && s.conversionRate < 1;
                  return (
                    <tr key={s.source} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-xs text-foreground font-medium">{s.source}</td>
                      <td className="py-2 pr-4 text-xs text-foreground text-right tabular-nums">{s.visitors}</td>
                      {sourceTab === "last30" && (
                        <>
                          <td className="py-2 pr-4 text-xs text-foreground text-right tabular-nums">{s.purchases}</td>
                          <td className={`py-2 pr-4 text-xs text-right tabular-nums ${lowConv ? "text-rose-600 font-semibold" : "text-foreground"}`}>
                            %{s.conversionRate}
                            {lowConv ? " ⚠️" : ""}
                          </td>
                          <td className="py-2 text-xs text-foreground text-right tabular-nums">{fmtTL(s.revenue)}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAYLAR — collapsible */}
      <div className="bg-white border rounded-2xl">
        <button
          type="button"
          onClick={() => setShowDetails((s) => !s)}
          className="w-full flex items-center justify-between px-4 md:px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/30 transition rounded-2xl"
        >
          <span className="flex items-center gap-2">
            Detaylar
            <span className="text-xs font-normal text-muted-foreground">
              (sayfa dağılımı + ziyaretçi listesi)
            </span>
          </span>
          {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showDetails && (
          <div className="border-t px-4 md:px-5 py-4 space-y-5">
            {/* SAYFA BAZLI */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-foreground">Sayfa Bazlı Dağılım</h3>
              {Object.keys(pageStats).length === 0 ? (
                <p className="text-sm text-muted-foreground">Henüz aktif ziyaretçi yok.</p>
              ) : (
                <div className="space-y-1.5">
                  {Object.entries(pageStats)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([path, count]) => (
                      <div key={path} className="flex items-center justify-between rounded-lg border px-3 py-2">
                        <span className="text-xs text-foreground truncate pr-3">{path}</span>
                        <span className="text-xs font-semibold text-primary tabular-nums">{count}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* ZİYARETÇİ LİSTESİ */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-foreground">Ziyaretçi Listesi</h3>
              <div className="overflow-x-auto -mx-4 md:-mx-5 px-4 md:px-5">
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
        )}
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  tone: "primary" | "amber" | "orange" | "emerald" | "rose";
}) {
  const tones: Record<string, { wrap: string; icon: string; value: string }> = {
    primary: { wrap: "border-border bg-white", icon: "text-primary bg-primary/10", value: "text-foreground" },
    amber: { wrap: "border-amber-200 bg-amber-50/40", icon: "text-amber-700 bg-amber-100", value: "text-amber-900" },
    orange: { wrap: "border-orange-200 bg-orange-50/40", icon: "text-orange-700 bg-orange-100", value: "text-orange-900" },
    emerald: { wrap: "border-emerald-200 bg-emerald-50/40", icon: "text-emerald-700 bg-emerald-100", value: "text-emerald-900" },
    rose: { wrap: "border-rose-200 bg-rose-50/40", icon: "text-rose-700 bg-rose-100", value: "text-rose-900" },
  };
  const t = tones[tone];
  return (
    <div className={`border rounded-2xl p-4 ${t.wrap}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <span className={`inline-flex items-center justify-center h-7 w-7 rounded-lg ${t.icon}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className={`text-2xl md:text-3xl font-bold tabular-nums ${t.value}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1 truncate">{sub}</p>}
    </div>
  );
}

function Chip({
  label,
  tone,
}: {
  label: string;
  tone: "emerald" | "amber" | "rose" | "primary";
}) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    primary: "bg-primary/10 text-primary border-primary/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${tones[tone]}`}>
      {label}
    </span>
  );
}
