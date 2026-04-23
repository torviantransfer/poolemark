"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, CheckCircle, Lock, ArrowRight } from "lucide-react";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Şifre en az 8 karakter olmalıdır.";
  if (!/[a-z]/.test(password)) return "Şifre en az bir küçük harf içermelidir.";
  if (!/[A-Z]/.test(password)) return "Şifre en az bir büyük harf içermelidir.";
  if (!/[0-9]/.test(password)) return "Şifre en az bir rakam içermelidir.";
  return null;
}

export default function SifreSifirlaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (password !== passwordConfirm) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error("Şifre güncellenirken bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    toast.success("Şifreniz başarıyla güncellendi!");
  }

  if (success) {
    return (
      <div>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Şifre Güncellendi
          </h1>
          <p className="text-muted-foreground mt-2">
            Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.
          </p>
        </div>
        <Button className="w-full h-11 gap-2" onClick={() => router.push("/giris")}>
          Giriş Yap
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div>
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Şifre Sıfırlama
          </h1>
          <p className="text-muted-foreground mt-2">
            Bağlantı doğrulanıyor, lütfen bekleyin...
          </p>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <div className="mt-6 pt-6 border-t text-center">
          <Link
            href="/sifremi-unuttum"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Bağlantı çalışmıyor mu? Yeni bağlantı isteyin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Yeni Şifre Belirleyin
        </h1>
        <p className="text-muted-foreground mt-2">
          Hesabınız için yeni bir şifre oluşturun.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password">Yeni Şifre</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="En az 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="pl-10 pr-10 h-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Büyük harf, küçük harf ve rakam içermelidir.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="passwordConfirm">Yeni Şifre Tekrar</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="Şifrenizi tekrar girin"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
              required
              className="pl-10 h-11"
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-11 text-base gap-2" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Şifreyi Güncelle"}
        </Button>
      </form>
    </div>
  );
}