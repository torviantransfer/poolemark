import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShippingCompanyForm } from "@/components/admin/shipping-company-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditShippingCompanyPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("shipping_companies")
    .select("*")
    .eq("id", id)
    .single();

  if (!company) notFound();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <Link
          href="/admin/kargolar"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Kargo Firmaları
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Kargo Firması Düzenle</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{company.name}</p>
      </div>
      <ShippingCompanyForm company={company} />
    </div>
  );
}
