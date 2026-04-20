import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CouponForm } from "@/components/admin/coupon-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCouponPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", id)
    .single();

  if (!coupon) notFound();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <Link
          href="/admin/kuponlar"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Kuponlar
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Kupon Düzenle</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{coupon.code}</p>
      </div>
      <CouponForm coupon={coupon} />
    </div>
  );
}
