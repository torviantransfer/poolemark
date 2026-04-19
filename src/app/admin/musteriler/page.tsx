import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/helpers";
import { Users, Eye } from "lucide-react";
import { AdminSearchForm } from "@/components/admin/search-form";

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminCustomersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const limit = 20;
  const from = (page - 1) * limit;

  const supabase = await createClient();
  let query = supabase
    .from("users")
    .select("id, first_name, last_name, email, phone, created_at, role", {
      count: "exact",
    })
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: customers, count } = await query;
  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Müşteriler</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {count || 0} müşteri
        </p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-4">
        <AdminSearchForm placeholder="Müşteri ara..." defaultValue={search} />
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground bg-secondary/30">
                <th className="px-5 py-3 font-medium">Ad Soyad</th>
                <th className="px-5 py-3 font-medium">E-posta</th>
                <th className="px-5 py-3 font-medium">Telefon</th>
                <th className="px-5 py-3 font-medium">Kayıt Tarihi</th>
                <th className="px-5 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {customers && customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3 font-medium">
                      {c.first_name} {c.last_name}
                    </td>
                    <td className="px-5 py-3 text-foreground/70">{c.email}</td>
                    <td className="px-5 py-3 text-foreground/70">{c.phone || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/musteriler/${c.id}`}
                        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors inline-flex"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    {search ? "Aramanızla eşleşen müşteri bulunamadı" : "Henüz müşteri yok"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t">
            <p className="text-sm text-muted-foreground">Sayfa {page} / {totalPages}</p>
            <div className="flex gap-1">
              {page > 1 && (
                <Link href={`/admin/musteriler?page=${page - 1}${search ? `&search=${search}` : ""}`} className="px-3 py-1.5 rounded-lg text-sm bg-secondary hover:bg-secondary/80">Önceki</Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/musteriler?page=${page + 1}${search ? `&search=${search}` : ""}`} className="px-3 py-1.5 rounded-lg text-sm bg-secondary hover:bg-secondary/80">Sonraki</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
