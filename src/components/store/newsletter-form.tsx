"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Check, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  variant?: "default" | "hero";
}

export function NewsletterForm({ variant = "default" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Harika! Artık fırsatlardan haberdar olacaksınız.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Bir hata oluştu");
      }
    } catch {
      setStatus("error");
      setMessage("Bir hata oluştu, tekrar deneyin");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm",
          variant === "hero"
            ? "bg-white/15 text-white backdrop-blur-sm"
            : "bg-green-50 text-green-700"
        )}
      >
        <Check className="h-5 w-5" />
        {message}
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className="space-y-3">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input
              type="email"
              placeholder="E-posta adresinizi girin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-11 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/40 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            disabled={status === "loading"}
            className="h-12 px-8 bg-white text-primary hover:bg-white/90 font-semibold rounded-xl shrink-0 w-full sm:w-auto"
          >
            {status === "loading" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Abone Ol
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
        {status === "error" && (
          <p aria-live="polite" className="text-sm text-red-200 text-center">{message}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
      <Input
        type="email"
        placeholder="E-posta adresiniz"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 bg-white"
      />
      <Button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 gap-2"
        aria-label="Bultene abone ol"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="sr-only">Yukleniyor</span>
          </>
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Abone Ol</span>
      </Button>
      {status === "error" && (
        <p aria-live="polite" className="text-xs text-destructive mt-1">{message}</p>
      )}
    </form>
  );
}
