import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminProductAddPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*, children:categories!parent_id(id, name)")
    .is("parent_id", null)
    .order("sort_order");

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/urunler"
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Yeni Ürün</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Mağazanıza yeni ürün ekleyin
          </p>
        </div>
      </div>
      <ProductForm categories={categories || []} />
    </div>
  );
}
