"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Truck,
  Home,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  ExternalLink,
} from "lucide-react";
import { formatPrice, formatDateTime } from "@/lib/helpers";
import type { Metadata } from "next";

interface TrackResult {
  orderNumber: string;
  status: string;
  statusLabel: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  cargoCompany: string | null;
  cargoTrackingNumber: string | null;
  cargoTrackingUrl: string | null;
  createdAt: string;
  updatedAt: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    city: string;
    district: string;
  };
  items: { id: string; product_name: string; quantity: number; unit_price: number }[];
}

const STATUS_STEPS = [
  { key: "pending", label: "Beklemede", icon: Clock },
  { key: "confirmed", label: "Onaylandı", icon: CheckCircle2 },
  { key: "preparing", label: "Hazırlanıyor", icon: Package },
  { key: "shipped", label: "Kargoya Verildi", icon: Truck },
  { key: "delivered", label: "Teslim Edildi", icon: Home },
];

const STATUS_ORDER = ["pending", "confirmed", "preparing", "shipped", "delivered"];

export default function SiparisTakipPage() {
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [orderNumber, setOrderNumber] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const body =
        tab === "email"
          ? { orderNumber, email: emailOrPhone }
          : { orderNumber, phone: emailOrPhone };

      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Bir hata oluştu.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  const currentStepIndex = result
    ? STATUS_ORDER.indexOf(result.status)
    : -1;

  const isCancelled =
    result?.status === "cancelled" || result?.status === "refunded";

  return (
    <section className="pt-8 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Search className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Sipariş Takibi</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sipariş numaranız ve e-posta ya da telefon numaranızla kargo durumunuzu sorgulayın.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          {/* Tab Toggle */}
          <div className="flex rounded-xl border border-border overflow-hidden mb-5 text-sm font-medium">
            <button
              type="button"
              onClick={() => { setTab("email"); setEmailOrPhone(""); }}
              className={`flex-1 py-2.5 transition-colors ${tab === "email" ? "bg-primary text-white" : "hover:bg-secondary/60 text-muted-foreground"}`}
            >
              E-posta ile sorgula
            </button>
            <button
              type="button"
              onClick={() => { setTab("phone"); setEmailOrPhone(""); }}
              className={`flex-1 py-2.5 transition-colors ${tab === "phone" ? "bg-primary text-white" : "hover:bg-secondary/60 text-muted-foreground"}`}
            >
              Telefon ile sorgula
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="orderNumber" className="mb-1.5 block">Sipariş Numarası</Label>
              <Input
                id="orderNumber"
                placeholder="Örn: PM-20250419-1234"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div>
              <Label htmlFor="identifier" className="mb-1.5 block">
                {tab === "email" ? "E-posta Adresi" : "Telefon Numarası"}
              </Label>
              <Input
                id="identifier"
                type={tab === "email" ? "email" : "tel"}
                placeholder={tab === "email" ? "ornek@mail.com" : "05XX XXX XX XX"}
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2.5">
                <XCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 gap-2" disabled={loading}>
              <Search className="h-4 w-4" />
              {loading ? "Sorgulanıyor..." : "Siparişi Sorgula"}
            </Button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-6 rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            {/* Order Header */}
            <div className="p-5 border-b bg-secondary/20">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Sipariş No</p>
                  <p className="font-bold text-foreground">{result.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Tarih</p>
                  <p className="text-sm font-medium">{formatDateTime(result.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="p-5 border-b">
              <h3 className="text-sm font-semibold mb-4">Sipariş Durumu</h3>
              {isCancelled ? (
                <div className="flex items-center gap-2 text-sm text-destructive font-medium">
                  <XCircle className="h-5 w-5" />
                  {result.statusLabel}
                </div>
              ) : (
                <div className="relative grid grid-cols-5">
                  {/* Background bar */}
                  <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gray-200" />
                  {/* Active bar */}
                  {currentStepIndex > 0 && (
                    <div
                      className="absolute top-5 left-[10%] h-0.5 bg-primary transition-all duration-700"
                      style={{
                        width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 80}%`,
                      }}
                    />
                  )}
                  {STATUS_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const done = i <= currentStepIndex;
                    const active = i === currentStepIndex;
                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div
                          className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                            done
                              ? "bg-primary border-primary text-white"
                              : "bg-white border-gray-200 text-gray-400"
                          } ${active ? "ring-2 ring-primary/30 ring-offset-1" : ""}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <p className={`text-[10px] text-center mt-1.5 font-medium ${done ? "text-primary" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cargo Info */}
            {result.cargoTrackingNumber && (
              <div className="p-5 border-b bg-amber-50/50">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Kargo Firması</p>
                    <p className="text-sm font-semibold">{result.cargoCompany || "Belirtilmemiş"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Takip No: <span className="font-mono font-semibold text-foreground">{result.cargoTrackingNumber}</span></p>
                  </div>
                  {result.cargoTrackingUrl && (
                    <a
                      href={result.cargoTrackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-lg px-3 py-2 hover:bg-primary/5 transition-colors"
                    >
                      Kargo Takip
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Address */}
            <div className="p-5 border-b">
              <p className="text-xs text-muted-foreground mb-1">Teslimat Adresi</p>
              <p className="text-sm font-medium">
                {result.shippingAddress.firstName} {result.shippingAddress.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {result.shippingAddress.district}, {result.shippingAddress.city}
              </p>
            </div>

            {/* Order Items */}
            <div className="p-5 border-b">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ürünler</p>
              <div className="space-y-2">
                {result.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground/80">
                      {item.product_name}
                      <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                    </span>
                    <span className="font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Totals */}
            <div className="p-5 space-y-1.5">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Ara Toplam</span>
                <span>{formatPrice(result.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Kargo</span>
                <span>{result.shippingCost === 0 ? "Ücretsiz" : formatPrice(result.shippingCost)}</span>
              </div>
              {result.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>İndirim</span>
                  <span>-{formatPrice(result.discountAmount)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-foreground">
                <span>Toplam</span>
                <span>{formatPrice(result.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
