import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShippingCompanyForm } from "@/components/admin/shipping-company-form";

export default function AddShippingCompanyPage() {
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
        <h1 className="text-2xl font-bold text-foreground">Yeni Kargo Firması</h1>
      </div>
      <ShippingCompanyForm />
    </div>
  );
}
