"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

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
    // Supabase otomatik olarak URL hash'ten token'ı okur
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

    const { error } = await supabase.auth.updateUser({
      password,
    });

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
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Şifre Güncellendi</CardTitle>
          <CardDescription>
            Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş
            yapabilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push("/giris")}>
            Giriş Yap
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!sessionReady) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Şifre Sıfırlama</CardTitle>
          <CardDescription>
            Bağlantı doğrulanıyor, lütfen bekleyin...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            href="/sifremi-unuttum"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Bağlantı çalışmıyor mu? Yeni bağlantı isteyin
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Yeni Şifre Belirleyin</CardTitle>
        <CardDescription>
          Hesabınız için yeni bir şifre oluşturun.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Yeni Şifre</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="En az 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Büyük harf, küçük harf ve rakam içermelidir.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">Yeni Şifre Tekrar</Label>
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="Şifrenizi tekrar girin"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Şifreyi Güncelle
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
