"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronRight,
  User,
  Loader2,
  Check,
} from "lucide-react";

export default function ProfilePage() {
  const { user, loading: authLoading } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("users")
      .select("first_name, last_name, phone")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setPhone(data.phone || "");
        }
        setLoading(false);
      });
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone,
        })
        .eq("id", user.id);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Şifreler eşleşmiyor.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordError(error.message);
        return;
      }

      setNewPassword("");
      setConfirmPassword("");
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 3000);
    });
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <section className="bg-secondary/40 border-b">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/hesabim" className="hover:text-primary transition-colors">Hesabım</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Bilgilerim</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Bilgilerim</h1>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-2xl space-y-6">
          {/* Profile Form */}
          <form onSubmit={handleSave} className="bg-white rounded-2xl border p-5 md:p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Kişisel Bilgiler
            </h2>

            <div>
              <Label>E-posta</Label>
              <Input value={user?.email || ""} disabled className="mt-1 bg-secondary/40" />
              <p className="text-xs text-muted-foreground mt-1">E-posta adresi değiştirilemez.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Ad</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="lastName">Soyad</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-1" />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" placeholder="0 (5XX) XXX XX XX" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Kaydet
              </Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <Check className="h-4 w-4" /> Kaydedildi
                </span>
              )}
            </div>
          </form>

          {/* Password Change */}
          <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl border p-5 md:p-6 space-y-4">
            <h2 className="font-semibold">Şifre Değiştir</h2>

            <div>
              <Label htmlFor="newPassword">Yeni Şifre</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1"
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1"
                minLength={6}
              />
            </div>

            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" variant="outline" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Şifreyi Güncelle
              </Button>
              {passwordSaved && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <Check className="h-4 w-4" /> Şifre güncellendi
                </span>
              )}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
