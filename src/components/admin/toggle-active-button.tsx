"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export function AdminToggleActiveButton({
  id,
  table,
  isActive,
}: {
  id: string;
  table: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from(table)
        .update({ is_active: !isActive })
        .eq("id", id);
      if (error) throw error;
      router.refresh();
    } catch {
      alert("Durum güncellenemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
        isActive
          ? "bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600"
          : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700"
      }`}
      title={isActive ? "Pasife al" : "Aktife al"}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : null}
      {isActive ? "Aktif" : "Pasif"}
    </button>
  );
}
