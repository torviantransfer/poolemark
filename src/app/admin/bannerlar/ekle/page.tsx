import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BannerForm } from "@/components/admin/banner-form";

export default function AddBannerPage() {
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
        <h1 className="text-2xl font-bold text-foreground">Yeni Banner</h1>
      </div>
      <BannerForm />
    </div>
  );
}
