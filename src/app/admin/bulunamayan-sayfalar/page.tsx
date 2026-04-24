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
    <div className="px-4 lg:px-8 py-6 lg:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Bulunamayan Sayfalar (404)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Son 1000 isteği gösterir. Sıkça gelen URL'ler için{" "}
          <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">
            next.config.ts
          </code>{" "}
          içinde 301 yönlendirme tanımlamak SEO açısından önemlidir.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card label="Toplam İstek" value={logs.length} />
        <Card label="Benzersiz URL" value={summary.length} />
        <Card
          label="En Çok"
          value={summary[0]?.count ?? 0}
          sub={summary[0]?.path ?? "-"}
        />
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">URL</th>
                <th className="text-right px-4 py-3 font-medium">Sayı</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  Son
                </th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
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
                <tr key={row.path} className="border-t hover:bg-secondary/30">
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
    <div className="bg-white border rounded-xl p-4">
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
