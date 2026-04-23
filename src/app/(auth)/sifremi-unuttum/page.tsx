"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, MailCheck, Mail } from "lucide-react";

export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      toast.error("Lütfen e-posta adresinizi girin.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/sifre-sifirla`,
    });

    if (error) {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
            <MailCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            E-posta Gönderildi
          </h1>
          <p className="text-muted-foreground mt-2">
            Şifre sıfırlama bağlantısı{" "}
            <strong className="text-foreground">{email}</strong> adresine
            gönderildi. Lütfen gelen kutunuzu kontrol edin.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full h-11 gap-2"
          render={<Link href="/giris" />}
        >
          <ArrowLeft className="h-4 w-4" />
          Giriş Sayfasına Dön
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Şifremi Unuttum
        </h1>
        <p className="text-muted-foreground mt-2">
          E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">E-posta Adresi</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="pl-10 h-11"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base gap-2"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Sıfırlama Bağlantısı Gönder"
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t text-center">
        <Link
          href="/giris"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Giriş sayfasına dön
        </Link>
      </div>
    </div>
  );
}