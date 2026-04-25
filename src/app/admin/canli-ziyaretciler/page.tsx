"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Eye, Users, UserCheck, MapPin, Sparkles, Repeat } from "lucide-react";

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
};

export default function AdminLiveVisitorsPage() {
  const [entries, setEntries] = useState<PresenceEntry[]>([]);

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
  const returningCount = entries.filter((e) => e.isReturning).length;
  const newCount = Math.max(entries.length - returningCount, 0);
  const sourceStats = useMemo(() => {
    return entries.reduce<Record<string, number>>((acc, item) => {
      const key = item.source || "direct";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [entries]);

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
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full w-fit ${entry.isReturning ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {entry.isReturning ? "Geri Dönen" : "Yeni"}
                      </span>
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
                        {entry.country && entry.country !== "Turkey" ? ` (${entry.country})` : ""}
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
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
