"use client";

import { useEffect, useState, useRef } from "react";
import { Package, Truck, Home } from "lucide-react";


const CARGO_COMPANIES = ["Sürat", "Aras", "MNG"];
const CUTOFF_HOUR = 14;
const DELIVERY_DAYS = 2;
const MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const DAYS = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];

function isWeekend(d: Date) { const w = d.getDay(); return w === 0 || w === 6; }

function nextBusinessDay(from: Date): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  while (isWeekend(d)) d.setDate(d.getDate() + 1);
  return d;
}

function addBusinessDays(date: Date, n: number): Date {
  const r = new Date(date);
  let added = 0;
  while (added < n) { r.setDate(r.getDate() + 1); if (!isWeekend(r)) added++; }
  return r;
}

function fmtDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${DAYS[d.getDay()]}`;
}

interface ShippingInfo {
  statusText: string;
  badgeText: string;
  badgeAmber: boolean;
  isSameDay: boolean;
  cargoDateText: string;
  deliveryDateText: string;
  progressPct: number;
  cutoffTarget: Date | null;
}

export function ShippingTimeline() {
  const [shipping, setShipping] = useState<ShippingInfo | null>(null);
  const [countdown, setCountdown] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
    const isBusinessDay = !isWeekend(now);
    const beforeCutoff = now.getHours() < CUTOFF_HOUR;

    let shipDate: Date;
    let isSameDay = false;

    if (isBusinessDay && beforeCutoff) {
      shipDate = new Date(now);
      isSameDay = true;
    } else {
      shipDate = nextBusinessDay(now);
    }

    const deliveryDate = addBusinessDays(shipDate, DELIVERY_DAYS);

    let badgeText: string;
    let badgeAmber = false;

    if (isSameDay) {
      badgeText = "Bugün Kargoda";
    } else {
      badgeAmber = true;
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const sd = new Date(shipDate);
      sd.setHours(0, 0, 0, 0);
      badgeText = tomorrow.getTime() === sd.getTime()
        ? "Yarın Kargoda"
        : `${DAYS[shipDate.getDay()]} Kargoda`;
    }

    const cutoffTarget = isSameDay
      ? (() => { const t = new Date(now); t.setHours(CUTOFF_HOUR, 0, 0, 0); return t; })()
      : null;

    setShipping({
      statusText: isSameDay ? "Aynı Gün Kargo Fırsatı!" : "Sipariş Hazırlanıyor",
      badgeText,
      badgeAmber,
      isSameDay,
      cargoDateText: isSameDay ? "Bugün" : fmtDate(shipDate),
      deliveryDateText: fmtDate(deliveryDate),
      progressPct: isSameDay ? 35 : 20,
      cutoffTarget,
    });

    if (cutoffTarget) {
      const tick = () => {
        const diff = cutoffTarget.getTime() - Date.now();
        if (diff > 0) {
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setCountdown(`${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} kaldı`);
        } else {
          setCountdown("Süre Doldu");
          if (timerRef.current) clearInterval(timerRef.current);
        }
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
    }

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  if (!shipping) return null;

  const { statusText, badgeText, badgeAmber, cargoDateText, deliveryDateText, progressPct, cutoffTarget } = shipping;
  const isGreen = !badgeAmber;

  return (
    <>
      <div className="mt-5 space-y-2">
        {/* Kargo Kartı */}
        <div className="rounded-xl border border-border/60 overflow-hidden shadow-sm bg-white">
          <div className={`px-4 py-2.5 flex items-center justify-between border-b ${isGreen ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"}`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${isGreen ? "bg-green-500" : "bg-amber-500"}`} />
              <span className={`text-[13px] font-bold ${isGreen ? "text-green-800" : "text-amber-800"}`}>{statusText}</span>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full text-white leading-none ${isGreen ? "bg-green-500" : "bg-amber-500"}`}>
              {cutoffTarget && countdown ? countdown : badgeText}
            </span>
          </div>

          <div className="px-5 pt-4 pb-3">
            <div className="relative flex justify-between items-start">
              <div className="absolute top-[18px] left-[28px] right-[28px] h-[3px] bg-gray-100 rounded-full" />
              <div
                className={`absolute top-[18px] left-[28px] h-[3px] rounded-full transition-all duration-[1200ms] ${isGreen ? "bg-green-500" : "bg-amber-400"}`}
                style={{ width: `${progressPct}%` }}
              />
              <div className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
                <div className={`w-9 h-9 rounded-full border-2 bg-white flex items-center justify-center shadow-sm ${isGreen ? "border-green-500" : "border-amber-400"}`}>
                  <Package className={`w-4 h-4 ${isGreen ? "text-green-600" : "text-amber-500"}`} />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Sipariş</p>
                <p className={`text-[11px] font-bold ${isGreen ? "text-green-700" : "text-amber-700"}`}>Bugün</p>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
                <div className="w-9 h-9 rounded-full border-2 border-border bg-white flex items-center justify-center shadow-sm">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Kargoda</p>
                <p className="text-[11px] font-bold text-foreground">{cargoDateText}</p>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
                <div className="w-9 h-9 rounded-full border-2 border-border bg-white flex items-center justify-center shadow-sm">
                  <Home className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Teslimat</p>
                <p className="text-[11px] font-bold text-foreground">{deliveryDateText}</p>
              </div>
            </div>


          </div>
        </div>


      </div>

    </>
  );
}
