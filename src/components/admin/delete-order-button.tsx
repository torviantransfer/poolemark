"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteOrderButton({
  orderId,
  variant = "default",
}: {
  orderId: string;
  variant?: "default" | "icon";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Bu siparişi kalıcı olarak silmek istediğinizden emin misiniz?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Silme başarısız");
        return;
      }
      router.push("/admin/siparisler");
      router.refresh();
    } catch {
      alert("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        title="Siparişi Sil"
        className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors inline-flex disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Siparişi Sil
    </button>
  );
}
