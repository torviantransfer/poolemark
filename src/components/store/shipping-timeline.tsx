"use client";

import { useEffect, useState } from "react";
import { Package, Truck, Home } from "lucide-react";

interface ShippingInfo {
  badgeLabel: string;
  badgeColor: "green" | "amber";
  cargoDate: string;
  deliveryDate: string;
}

export function ShippingTimeline() {
  const [shipping, setShipping] = useState<ShippingInfo | null>(null);

  useEffect(() => {
    const now = new Date();
    const turkeyTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
    const dayOfWeek = turkeyTime.getDay(); // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
    const hour = turkeyTime.getHours();
    const minutes = turkeyTime.getMinutes();
    const currentTime = hour * 60 + minutes;

    let cargoDate: Date;
    let badgeLabel: string;
    let badgeColor: "green" | "amber";

    if (dayOfWeek === 0) {
      // Pazar → Pazartesi kargo
      cargoDate = addDays(turkeyTime, 1);
      badgeLabel = "Pazartesi kargoda";
      badgeColor = "amber";
    } else if (dayOfWeek === 6) {
      // Cumartesi
      if (currentTime < 11 * 60) {
        // 11:00 öncesi → bugün kargo
        cargoDate = new Date(turkeyTime);
        badgeLabel = "Bugün kargoda";
        badgeColor = "green";
      } else {
        // 11:00 sonrası → Pazartesi kargo
        cargoDate = addDays(turkeyTime, 2);
        badgeLabel = "Pazartesi kargoda";
        badgeColor = "amber";
      }
    } else {
      // Pazartesi–Cuma
      if (currentTime < 14 * 60) {
        // 14:00 öncesi → bugün kargo
        cargoDate = new Date(turkeyTime);
        badgeLabel = "Bugün kargoda";
        badgeColor = "green";
      } else if (dayOfWeek === 5) {
        // Cuma 14:00 sonrası → Pazartesi kargo
        cargoDate = addDays(turkeyTime, 3);
        badgeLabel = "Pazartesi kargoda";
        badgeColor = "amber";
      } else {
        // Pazartesi–Perşembe 14:00 sonrası → yarın kargo
        cargoDate = addDays(turkeyTime, 1);
        badgeLabel = "Yarın kargoda";
        badgeColor = "amber";
      }
    }

    const deliveryDate = addBusinessDays(cargoDate, 2);

    setShipping({
      badgeLabel,
      badgeColor,
      cargoDate: formatDate(cargoDate),
      deliveryDate: formatDate(deliveryDate),
    });
  }, []);

  if (!shipping) return null;

  const isGreen = shipping.badgeColor === "green";

  return (
    <div className="mt-8 pt-8 border-t border-border/30">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-foreground">Sipariş Zamanlaması</h3>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isGreen
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              isGreen ? "bg-green-600" : "bg-amber-600"
            }`}
          />
          {shipping.badgeLabel}
        </span>
      </div>

      {/* Timeline — connected bar */}
      <div className="relative grid grid-cols-3">
        {/* Full background bar */}
        <div className="absolute top-5 left-[16.67%] right-[16.67%] h-0.5 bg-gray-200" />
        {/* Active segment: step 1 → step 2 */}
        <div className="absolute top-5 left-[16.67%] right-[50%] h-0.5 bg-green-400" />

        {/* Step 1: Hazırlanıyor */}
        <div className="flex flex-col items-center">
          <div className="relative z-10 w-10 h-10 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xs font-semibold text-foreground text-center mt-2">Hazırlanıyor</p>
          <p className="text-[10px] text-muted-foreground text-center mt-0.5">Bugün</p>
        </div>

        {/* Step 2: Kargo */}
        <div className="flex flex-col items-center">
          <div className="relative z-10 w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center">
            <Truck className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-xs font-semibold text-foreground text-center mt-2">Kargoya Verildi</p>
          <p className="text-[10px] text-muted-foreground text-center mt-0.5">{shipping.cargoDate}</p>
        </div>

        {/* Step 3: Teslimat */}
        <div className="flex flex-col items-center">
          <div className="relative z-10 w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
            <Home className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-xs font-semibold text-foreground text-center mt-2">Teslimat</p>
          <p className="text-[10px] text-muted-foreground text-center mt-0.5">{shipping.deliveryDate}</p>
        </div>
      </div>
    </div>
  );
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      added++;
    }
  }
  return result;
}

function formatDate(date: Date): string {
  const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${dayNames[date.getDay()]}`;
}
