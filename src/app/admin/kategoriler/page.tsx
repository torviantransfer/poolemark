import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FolderTree, Edit, Plus } from "lucide-react";
import { AdminDeleteButton } from "@/components/admin/delete-button";
import type { Category } from "@/types";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*, children:categories!parent_id(*, product_count:products(count))")
    .is("parent_id", null)
    .order("sort_order");

  // Get product counts for parent categories
  const { data: allCats } = await supabase
    .from("categories")
    .select("id, product_count:products(count)")
    .is("parent_id", null);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kategoriler</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ürün kategorilerini yönetin
          </p>
        </div>
        <Link
          href="/admin/kategoriler/ekle"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Yeni Kategori
        </Link>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground bg-secondary/30">
                <th className="px-5 py-3 font-medium">Kategori</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Alt Kategoriler</th>
                <th className="px-5 py-3 font-medium">Sıra</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {categories && categories.length > 0 ? (
                categories.map((cat: Category & { children?: Category[] }) => (
                  <>
                    <tr
                      key={cat.id}
                      className="border-b hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {cat.image_url ? (
                            <img
                              src={cat.image_url}
                              alt={cat.name}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                              <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-medium">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground font-mono text-xs">
                        {cat.slug}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {cat.children?.length || 0}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {cat.sort_order}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            cat.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {cat.is_active ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/kategoriler/${cat.id}`}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <AdminDeleteButton
                            id={cat.id}
                            table="categories"
                            label={cat.name}
                          />
                        </div>
                      </td>
                    </tr>
                    {cat.children?.map((child: Category) => (
                      <tr
                        key={child.id}
                        className="border-b hover:bg-secondary/20 transition-colors bg-secondary/10"
                      >
                        <td className="px-5 py-3 pl-12">
                          <span className="text-foreground/80">↳ {child.name}</span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground font-mono text-xs">
                          {child.slug}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">—</td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {child.sort_order}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              child.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {child.is_active ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/kategoriler/${child.id}`}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <AdminDeleteButton
                            id={child.id}
                            table="categories"
                            label={child.name}
                          />
                        </div>
                        </td>
                      </tr>
                    ))}
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                    <FolderTree className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    Henüz kategori eklenmemiş
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
