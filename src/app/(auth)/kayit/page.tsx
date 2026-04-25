"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { trackEvent } from "@/lib/meta-pixel";
import { gaSignUp } from "@/lib/ga";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
} from "lucide-react";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Şifre en az 8 karakter olmalıdır.";
  if (!/[a-z]/.test(password))
    return "Şifre en az bir küçük harf içermelidir.";
  if (!/[A-Z]/.test(password))
    return "Şifre en az bir büyük harf içermelidir.";
  if (!/[0-9]/.test(password)) return "Şifre en az bir rakam içermelidir.";
  return null;
}

function validatePhone(phone: string): boolean {
  return /^(05\d{9}|\+905\d{9})$/.test(phone.replace(/\s/g, ""));
}

export default function KayitPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.phone ||
      !form.password
    ) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }

    if (!validatePhone(form.phone)) {
      toast.error("Geçerli bir telefon numarası girin. (05XX XXX XX XX)");
      return;
    }

    const passwordError = validatePassword(form.password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (form.password !== form.passwordConfirm) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }

    if (!accepted) {
      toast.error("Üyelik sözleşmesini kabul etmelisiniz.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Bu e-posta adresi zaten kayıtlı.");
      } else {
        toast.error(
          "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin."
        );
      }
      setLoading(false);
      return;
    }

    if (data.session) {
      // E-posta onayı kapalıysa direkt oturum açılır
      trackEvent(
        "CompleteRegistration",
        { status: true, currency: "TRY", value: 0 },
        { userEmail: form.email, userPhone: form.phone }
      );
      gaSignUp("email");
      toast.success("Kayıt başarılı! Hoş geldiniz.");
      router.push("/hesabim");
    } else {
      // E-posta onayı gerekiyor
      trackEvent(
        "CompleteRegistration",
        { status: "pending_confirmation", currency: "TRY", value: 0 },
        { userEmail: form.email, userPhone: form.phone }
      );
      gaSignUp("email");
      toast.success("Kayıt başarılı! Lütfen e-posta adresinize gönderilen onay bağlantısına tıklayın.", { duration: 6000 });
      router.push("/giris");
    }
    router.refresh();
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Hesap Oluşturun
        </h1>
        <p className="text-muted-foreground mt-2">
          Hemen ücretsiz üye olun ve alışverişe başlayın
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Ad</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="firstName"
                placeholder="Adınız"
                value={form.firstName}
                onChange={(e) => updateForm("firstName", e.target.value)}
                autoComplete="given-name"
                required
                className="pl-10 h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Soyad</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="lastName"
                placeholder="Soyadınız"
                value={form.lastName}
                onChange={(e) => updateForm("lastName", e.target.value)}
                autoComplete="family-name"
                required
                className="pl-10 h-11"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
              autoComplete="email"
              required
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="05XX XXX XX XX"
              value={form.phone}
              onChange={(e) => updateForm("phone", e.target.value)}
              autoComplete="tel"
              required
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="En az 8 karakter"
              value={form.password}
              onChange={(e) => updateForm("password", e.target.value)}
              autoComplete="new-password"
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
          <p className="text-xs text-muted-foreground">
            Büyük harf, küçük harf ve rakam içermelidir.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="passwordConfirm">Şifre Tekrar</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="Şifrenizi tekrar girin"
              value={form.passwordConfirm}
              onChange={(e) => updateForm("passwordConfirm", e.target.value)}
              autoComplete="new-password"
              required
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div className="flex items-start space-x-2 pt-1">
          <Checkbox
            id="terms"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
          />
          <label
            htmlFor="terms"
            className="text-sm text-muted-foreground leading-tight"
          >
            <Link
              href="/uyelik-sozlesmesi"
              target="_blank"
              className="text-primary hover:underline font-medium"
            >
              Üyelik Sözleşmesi
            </Link>
            {" "}ve{" "}
            <Link
              href="/kvkk-aydinlatma-metni"
              target="_blank"
              className="text-primary hover:underline font-medium"
            >
              KVKK Aydınlatma Metni
            </Link>
            &apos;ni okudum ve kabul ediyorum.
          </label>
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
              Kayıt Ol
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t text-center">
        <p className="text-sm text-muted-foreground">
          Zaten hesabınız var mı?{" "}
          <Link
            href="/giris"
            className="text-primary font-semibold hover:underline"
          >
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
