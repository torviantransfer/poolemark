import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/helpers";
import { Plus, Search, Edit, Eye, Package } from "lucide-react";
import { AdminDeleteButton } from "@/components/admin/delete-button";
import { AdminSearchForm } from "@/components/admin/search-form";

interface Props {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const status = params.status || "all";
  const limit = 20;
  const from = (page - 1) * limit;

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      "id, name, slug, price, compare_at_price, stock_quantity, is_active, is_featured, created_at, category:categories!category_id(name), images:product_images(url, is_primary)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (search) query = query.ilike("name", `%${search}%`);
  if (status === "active") query = query.eq("is_active", true);
  if (status === "inactive") query = query.eq("is_active", false);
  if (status === "featured") query = query.eq("is_featured", true);

  const { data: products, count } = await query;
  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ürünler</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {count || 0} ürün bulundu
          </p>
        </div>
        <Link
          href="/admin/urunler/ekle"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Yeni Ürün
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <AdminSearchForm
            placeholder="Ürün ara..."
            defaultValue={search}
          />
          <div className="flex gap-2">
            {[
              { value: "all", label: "Tümü" },
              { value: "active", label: "Aktif" },
              { value: "inactive", label: "Pasif" },
              { value: "featured", label: "Öne Çıkan" },
            ].map((s) => (
              <Link
                key={s.value}
                href={`/admin/urunler?status=${s.value}${search ? `&search=${search}` : ""}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  status === s.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground/70 hover:bg-secondary/80"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground bg-secondary/30">
                <th className="px-5 py-3 font-medium">Ürün</th>
                <th className="px-5 py-3 font-medium">Kategori</th>
                <th className="px-5 py-3 font-medium">Fiyat</th>
                <th className="px-5 py-3 font-medium">Stok</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {products && products.length > 0 ? (
                products.map((product) => {
                  const primaryImage =
                    product.images?.find((i: { is_primary: boolean }) => i.is_primary)?.url ||
                    product.images?.[0]?.url;
                  return (
                    <tr
                      key={product.id}
                      className="border-b last:border-0 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden shrink-0">
                            {primaryImage ? (
                              <img
                                src={primaryImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[200px]">
                              {product.name}
                            </p>
                            {product.is_featured && (
                              <span className="text-xs text-amber-600">⭐ Öne Çıkan</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-foreground/70">
                        {(product.category as any)?.name || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div>
                          <span className="font-medium">
                            {formatPrice(product.price)}
                          </span>
                          {product.compare_at_price && (
                            <span className="text-xs text-muted-foreground line-through ml-1">
                              {formatPrice(product.compare_at_price)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.stock_quantity === 0
                              ? "bg-red-100 text-red-700"
                              : product.stock_quantity < 5
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.is_active ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            title="Önizle"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/urunler/${product.id}`}
                            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            title="Düzenle"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <AdminDeleteButton
                            id={product.id}
                            table="products"
                            label={product.name}
                            redirectTo="/admin/urunler"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center text-muted-foreground"
                  >
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    {search ? "Aramanızla eşleşen ürün bulunamadı" : "Henüz ürün eklenmemiş"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Sayfa {page} / {totalPages}
            </p>
            <div className="flex gap-1">
              {page > 1 && (
                <Link
                  href={`/admin/urunler?page=${page - 1}${search ? `&search=${search}` : ""}${status !== "all" ? `&status=${status}` : ""}`}
                  className="px-3 py-1.5 rounded-lg text-sm bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  Önceki
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/urunler?page=${page + 1}${search ? `&search=${search}` : ""}${status !== "all" ? `&status=${status}` : ""}`}
                  className="px-3 py-1.5 rounded-lg text-sm bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  Sonraki
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
