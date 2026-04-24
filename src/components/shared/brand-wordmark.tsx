import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandWordmarkProps {
  href?: string;
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  subtitle?: string;
  logoSrc?: string;
}

const sizeClasses = {
  sm: "text-sm md:text-base tracking-[0.18em]",
  md: "text-base md:text-lg tracking-[0.2em]",
  lg: "text-xl md:text-2xl tracking-[0.28em]",
};

const subtitleClasses = {
  sm: "text-[8px] md:text-[9px] tracking-[0.14em]",
  md: "text-[9px] md:text-[10px] tracking-[0.16em]",
  lg: "text-[10px] md:text-[11px] tracking-[0.2em]",
};

const logoHeights = {
  sm: "h-7 md:h-7",
  md: "h-8 md:h-9",
  lg: "h-10 md:h-11",
};

const logoWidths = {
  sm: "w-7 md:w-7",
  md: "w-8 md:w-9",
  lg: "w-10 md:w-11",
};

export function BrandWordmark({
  href = "/",
  tone = "dark",
  size = "md",
  className,
  subtitle,
  logoSrc,
}: BrandWordmarkProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {logoSrc ? (
        <span className={cn("relative shrink-0", logoHeights[size], logoWidths[size])}>
          <Image
            src={logoSrc}
            alt="Poolemark"
            fill
            sizes="(max-width: 768px) 40px, 44px"
            className="object-contain"
            priority
          />
        </span>
      ) : null}
      <span className="inline-flex flex-col leading-none min-w-0">
        <span
          className={cn(
            "font-bold uppercase leading-none whitespace-nowrap",
            sizeClasses[size],
            tone === "light" ? "text-white" : "text-foreground"
          )}
        >
          POOLE<span style={{ color: "#1f9f4d" }}>MARK</span>
        </span>
        {subtitle ? (
          <span
            className={cn(
              "mt-0.5 md:mt-1 font-medium uppercase whitespace-nowrap",
              subtitleClasses[size],
              tone === "light" ? "text-white/55" : "text-muted-foreground"
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}