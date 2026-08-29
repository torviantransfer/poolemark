"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RotateCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-group error boundary for the storefront (/checkout, /odeme-sonucu, /sepet, ...).
 *
 * Without this, an uncaught render/effect error anywhere in the store left
 * visitors on a blank/frozen page with no way to recover — reported mostly
 * from mobile checkout, where in-app browsers (Instagram/Facebook/TikTok)
 * sometimes throw on storage access.
 */
export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
        <AlertTriangle className="h-10 w-10 text-[#E8712B]" />
      </div>
      <h1 className="mb-3 text-2xl font-semibold text-foreground">
        Bir şeyler ters gitti
      </h1>
      <p className="mb-8 max-w-sm text-muted-foreground">
        Sayfa yüklenirken beklenmeyen bir hata oluştu. Sepetiniz ve
        siparişiniz etkilenmedi — lütfen tekrar deneyin.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={() => reset()} className="gap-2">
          <RotateCw className="h-4 w-4" />
          Tekrar Dene
        </Button>
        <Button render={<Link href="/" />} variant="outline" size="lg" className="gap-2">
          <Home className="h-4 w-4" />
          Ana Sayfaya Dön
        </Button>
      </div>
    </div>
  );
}
