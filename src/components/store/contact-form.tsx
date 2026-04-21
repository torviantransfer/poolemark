"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Loader2, Check } from "lucide-react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        const data = await res.json();
        setStatus("error");
        setErrorMessage(data.error || "Bir hata oluştu");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Bir hata oluştu, tekrar deneyin");
    }
  }

  return (
    <>
      <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
        İletişim Formu
      </p>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
        Mesajınızı Gönderin
      </h2>
      <p className="text-muted-foreground mb-8">
        Formu doldurun, en kısa sürede size dönüş yapalım.
      </p>

      {status === "success" ? (
        <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Check className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Mesajınız Gönderildi
          </h3>
          <p className="text-muted-foreground">
            En kısa sürede size dönüş yapacağız. Teşekkür ederiz!
          </p>
          <Button
            onClick={() => setStatus("idle")}
            variant="outline"
            className="mt-6"
          >
            Yeni Mesaj Gönder
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Adınız Soyadınız"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ornek@email.com"
                required
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="phone">
                Telefon{" "}
                <span className="text-muted-foreground">(opsiyonel)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="05XX XXX XX XX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Konu</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Konu başlığı"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mesajınız</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Mesajınızı buraya yazın..."
              required
              rows={5}
            />
          </div>
          {status === "error" && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}
          <Button
            type="submit"
            disabled={status === "loading"}
            size="lg"
            className="w-full sm:w-auto h-12 px-8"
          >
            {status === "loading" ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Send className="mr-2 h-5 w-5" />
            )}
            Mesajı Gönder
          </Button>
        </form>
      )}
    </>
  );
}
