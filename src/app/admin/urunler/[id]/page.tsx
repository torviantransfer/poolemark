import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, images:product_images(*), variants:product_variants(*)")
      .eq("id", id)
      .single(),
    supabase
      .from("categories")
      .select("*, children:categories!parent_id(id, name)")
      .is("parent_id", null)
      .order("sort_order"),
  ]);

  if (!product) notFound();

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
          <h1 className="text-2xl font-bold text-foreground">Ürün Düzenle</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {product.name}
          </p>
        </div>
      </div>
      <ProductForm product={product} categories={categories || []} />
    </div>
  );
}
