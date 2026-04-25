"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";

export function AdminDeleteButton({
  id,
  table,
  label,
  redirectTo,
}: {
  id: string;
  table: string;
  label: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`"${label}" öğesini silmek istediğinize emin misiniz?`)) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch {
      alert("Silme işlemi başarısız oldu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
      title="Sil"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
