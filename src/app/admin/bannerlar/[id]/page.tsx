import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BannerForm } from "@/components/admin/banner-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBannerPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: banner } = await supabase
    .from("banners")
    .select("*")
    .eq("id", id)
    .single();

  if (!banner) notFound();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <Link
          href="/admin/bannerlar"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Bannerlar
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Banner Düzenle</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{banner.title}</p>
      </div>
      <BannerForm banner={banner} />
    </div>
  );
}
