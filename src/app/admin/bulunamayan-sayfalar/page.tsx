import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulunamayan Sayfalar (404)",
};

export const dynamic = "force-dynamic";

interface LogRow {
  path: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

export default async function NotFoundLogsPage() {
  const supabase = createAdminClient();

  // Pull recent 1000 logs and aggregate in JS (small dataset, simple query).
  const { data: rows } = await supabase
    .from("not_found_logs")
    .select("path, referrer, user_agent, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  const logs = (rows as LogRow[] | null) ?? [];

  const grouped = new Map<
    string,
    { count: number; lastSeen: string; referrers: Set<string> }
  >();
  for (const r of logs) {
    const key = r.path;
    const existing = grouped.get(key);
    if (existing) {
      existing.count += 1;
      if (r.referrer) existing.referrers.add(r.referrer);
    } else {
      grouped.set(key, {
        count: 1,
        lastSeen: r.created_at,
        referrers: new Set(r.referrer ? [r.referrer] : []),
      });
    }
  }

  const summary = Array.from(grouped.entries())
    .map(([path, v]) => ({ path, ...v }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-white/90 backdrop-blur shadow-sm px-5 py-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bulunamayan Sayfalar (404)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Son 1000 isteği gösterir.{" "}
            <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">
              next.config.ts
            </code>{" "}
            içinde 301 yönlendirme tanımlamak SEO açısından önemlidir.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card label="Toplam İstek" value={logs.length} />
        <Card label="Benzersiz URL" value={summary.length} />
        <Card
          label="En Çok"
          value={summary[0]?.count ?? 0}
          sub={summary[0]?.path ?? "-"}
        />
      </div>

      <div className="bg-white/90 backdrop-blur rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground bg-secondary/40">
                <th className="text-left px-4 py-3 font-medium text-sm">URL</th>
                <th className="text-right px-4 py-3 font-medium text-sm">Sayı</th>
                <th className="text-left px-4 py-3 font-medium text-sm hidden md:table-cell">
                  Son
                </th>
                <th className="text-left px-4 py-3 font-medium text-sm hidden lg:table-cell">
                  Yönlendiren
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center text-muted-foreground py-12"
                  >
                    Henüz 404 kaydı yok.
                  </td>
                </tr>
              )}
              {summary.slice(0, 200).map((row) => (
                <tr key={row.path} className="border-b last:border-0 hover:bg-primary/[0.04] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs break-all max-w-[400px]">
                    {row.path}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {row.count}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {new Date(row.lastSeen).toLocaleString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground max-w-[280px] truncate">
                    {Array.from(row.referrers).slice(0, 2).join(", ") || "-"}
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

function Card({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl border shadow-sm p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold text-foreground mt-1">{value}</div>
      {sub && (
        <div className="text-xs text-muted-foreground mt-1 truncate font-mono">
          {sub}
        </div>
      )}
    </div>
  );
}
