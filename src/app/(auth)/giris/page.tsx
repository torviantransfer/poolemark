"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { gaLogin } from "@/lib/ga";

export default function GirisPage() {
  return (
    <Suspense>
      <GirisForm />
    </Suspense>
  );
}

function GirisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        toast.error("E-posta adresinizi henüz onaylamadınız. Lütfen gelen kutunuzu kontrol edin.");
      } else if (error.message.toLowerCase().includes("invalid login") || error.status === 400) {
        toast.error("E-posta veya şifre hatalı.");
      } else {
        toast.error("Giriş yapılamadı. Lütfen tekrar deneyin.");
      }
      setLoading(false);
      return;
    }

    toast.success("Giriş başarılı!");
    gaLogin("email");
    router.push(redirect);
    router.refresh();
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Hoş Geldiniz
        </h1>
        <p className="text-muted-foreground mt-2">
          Hesabınıza giriş yaparak alışverişe devam edin
        </p>
      </div>

      {/* Form */}
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Şifre</Label>
            <Link
              href="/sifremi-unuttum"
              className="text-xs text-primary hover:underline font-medium"
            >
              Şifremi Unuttum
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="pl-10 pr-10 h-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
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
            <>
              Giriş Yap
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t text-center">
        <p className="text-sm text-muted-foreground">
          Henüz hesabınız yok mu?{" "}
          <Link
            href="/kayit"
            className="text-primary font-semibold hover:underline"
          >
            Ücretsiz Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}
