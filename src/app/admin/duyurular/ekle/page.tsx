import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnnouncementForm } from "@/components/admin/announcement-form";

export default function AddAnnouncementPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <Link
          href="/admin/duyurular"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Duyurular
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Yeni Duyuru</h1>
      </div>
      <AnnouncementForm />
    </div>
  );
}
