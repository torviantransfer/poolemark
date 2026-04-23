"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Bell, Check, Loader2 } from "lucide-react";

interface StockNotifyFormProps {
  productId: string;
  variantId?: string | null;
}

export function StockNotifyForm({ productId, variantId = null }: StockNotifyFormProps) {
  const { user } = useUser();
  const [email, setEmail] = useState(user?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Lütfen e-posta adresinizi girin.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stock-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), productId, variantId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Bir hata oluştu.");
        return;
      }
      toast.success(data.message || "Kayıt alındı.");
      setDone(true);
    } catch {
      toast.error("Bağlantı hatası, tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0">
          <Check className="h-4 w-4 text-primary" />
        </div>
        <div className="text-sm">
          <p className="font-semibold text-foreground">Bildirim alındı</p>
          <p className="text-muted-foreground text-xs">
            Ürün stoğa girince <span className="font-medium text-foreground">{email}</span> adresine haber vereceğiz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0">
          <Bell className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">Stoğa girince haber ver</p>
          <p className="text-xs text-muted-foreground">
            E-postanı bırak, ürün geldiğinde ilk sen bil.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="ornek@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10"
        />
        <Button type="submit" disabled={loading} className="h-10 shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Haber Ver"}
        </Button>
      </form>
    </div>
  );
}
