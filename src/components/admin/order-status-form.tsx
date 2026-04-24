"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_LABELS } from "@/constants";
import { Loader2 } from "lucide-react";

export function OrderStatusForm({
  orderId,
  currentStatus,
  currentPaymentStatus,
  cargoCompany,
  cargoTrackingNumber,
  invoiceNumber,
  invoiceUrl,
  orderTotal,
}: {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
  cargoCompany: string;
  cargoTrackingNumber: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  orderTotal: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [cargo, setCargo] = useState(cargoCompany);
  const [tracking, setTracking] = useState(cargoTrackingNumber);
  const [invoiceNo, setInvoiceNo] = useState(invoiceNumber || "");
  const [invoiceLink, setInvoiceLink] = useState(invoiceUrl || "");
  const [shippingCompanies, setShippingCompanies] = useState<string[]>([]);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/shipping-companies");
        const data = await res.json();
        setShippingCompanies((data.companies || []).map((c: { name: string }) => c.name));
      } catch {
        setShippingCompanies([]);
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          payment_status: paymentStatus,
          cargo_company: cargo || null,
          cargo_tracking_number: tracking || null,
          invoice_number: invoiceNo || null,
          invoice_url: invoiceLink || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Güncelleme başarısız");
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message || "Güncelleme başarısız oldu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefund() {
    const ok = window.confirm(`Bu sipariş için ${orderTotal.toFixed(2)} TL iade yapılsın mı?`);
    if (!ok) return;

    setRefunding(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: orderTotal }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "İade işlemi başarısız");
      }

      setPaymentStatus("refunded");
      setStatus("returned");
      alert("İade başarıyla tamamlandı.");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "İade işlemi başarısız oldu.");
    } finally {
      setRefunding(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border shadow-sm p-5 space-y-4"
    >
      <h2 className="text-base font-semibold">Durumu Güncelle</h2>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Sipariş Durumu
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Ödeme Durumu
        </label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="pending">Bekliyor</option>
          <option value="paid">Ödendi</option>
          <option value="failed">Başarısız</option>
          <option value="refunded">İade Edildi</option>
        </select>
      </div>

      {(status === "shipped" || status === "delivered") && (
        <>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Kargo Firması
            </label>
            <select
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <option value="">Seçin...</option>
              {shippingCompanies.map((companyName) => (
                <option key={companyName} value={companyName}>
                  {companyName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Takip Numarası
            </label>
            <input
              type="text"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="Kargo takip numarası"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </>
      )}

      <div className="pt-2 border-t space-y-3">
        <p className="text-sm font-medium text-foreground">Fatura Bilgisi</p>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Fatura Numarası
          </label>
          <input
            type="text"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            placeholder="Örn: PM-26040001"
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Fatura Linki (PDF)
          </label>
          <input
            type="url"
            value={invoiceLink}
            onChange={(e) => setInvoiceLink(e.target.value)}
            placeholder="https://.../fatura.pdf"
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || refunding}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Güncelle
      </button>

      {paymentStatus === "paid" && (
        <button
          type="button"
          onClick={handleRefund}
          disabled={loading || refunding}
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {refunding && <Loader2 className="h-4 w-4 animate-spin" />}
          {refunding ? "İade İşleniyor..." : `Tam İade Yap (${orderTotal.toFixed(2)} TL)`}
        </button>
      )}
    </form>
  );
}
