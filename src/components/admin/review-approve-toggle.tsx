"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, X } from "lucide-react";

export function ReviewApproveToggle({ id, isApproved }: { id: string; isApproved: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("reviews")
        .update({ is_approved: !isApproved })
        .eq("id", id)
        .select("id");
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Durum güncellenemedi.");
      }
      router.refresh();
    } catch {
      alert("Yorum durumu güncellenemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors ${
        isApproved
          ? "text-green-600 hover:bg-green-50"
          : "text-amber-600 hover:bg-amber-50"
      }`}
      title={isApproved ? "Onayı kaldır" : "Onayla"}
    >
      {isApproved ? <Check className="h-4 w-4" /> : <Check className="h-4 w-4" />}
    </button>
  );
}
