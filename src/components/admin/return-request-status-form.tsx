"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function ReturnRequestStatusForm({
  requestId,
  currentStatus,
  currentCompany,
  currentBarcode,
  currentAdminNote,
}: {
  requestId: string;
  currentStatus: string;
  currentCompany?: string | null;
  currentBarcode?: string | null;
  currentAdminNote?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [company, setCompany] = useState(currentCompany || "");
  const [barcode, setBarcode] = useState(currentBarcode || "");
  const [adminNote, setAdminNote] = useState(currentAdminNote || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/returns/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          return_shipping_company: company || null,
          return_barcode: barcode || null,
          admin_note: adminNote || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "İşlem başarısız");
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message || "İşlem başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm bg-white"
        >
          <option value="requested">Talep Alındı</option>
          <option value="approved">Onaylandı</option>
          <option value="in_transit">Kargoda</option>
          <option value="completed">Tamamlandı</option>
          <option value="rejected">Reddedildi</option>
        </select>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="İade kargo firması"
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="İade barkod kodu"
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white text-sm font-medium px-4 py-2.5 hover:bg-primary/90 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Güncelle
        </button>
      </div>
      <textarea
        rows={2}
        value={adminNote}
        onChange={(e) => setAdminNote(e.target.value)}
        placeholder="Admin notu"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
    </form>
  );
}
