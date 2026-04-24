"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "#0F172A",
          "--normal-text": "#F8FAFC",
          "--normal-border": "rgba(248,250,252,0.14)",
          "--success-bg": "#14532D",
          "--success-text": "#ECFDF5",
          "--success-border": "#22C55E",
          "--error-bg": "#7F1D1D",
          "--error-text": "#FEF2F2",
          "--error-border": "#EF4444",
          "--warning-bg": "#78350F",
          "--warning-text": "#FFFBEB",
          "--warning-border": "#F59E0B",
          "--info-bg": "#134E4A",
          "--info-text": "#ECFEFF",
          "--info-border": "#14B8A6",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        duration: 3500,
        classNames: {
          toast: "cn-toast border shadow-lg backdrop-blur-sm",
          title: "font-semibold",
          description: "text-[13px]",
          actionButton: "!bg-primary !text-primary-foreground hover:!bg-primary/90",
          cancelButton: "!bg-white/10 !text-white hover:!bg-white/20",
          closeButton: "!bg-white/10 !text-white hover:!bg-white/20",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
