import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageForm } from "@/components/admin/page-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminPageEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: page } = await supabase.from("pages").select("*").eq("id", id).single();
  if (!page) notFound();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/sayfalar" className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sayfa Düzenle</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{page.title}</p>
        </div>
      </div>
      <PageForm page={page} />
    </div>
  );
}
