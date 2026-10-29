// src/app/(dashboard)/_components/ui/Badge.tsx
import type { ReactNode } from "react";

type BadgeVariant = "muted" | "solid" | "outline" | "strong";

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
};

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  muted: "bg-neutral-200 text-neutral-800",
  solid: "bg-neutral-900 text-white",
  outline: "border border-neutral-300 bg-white text-neutral-700",
  strong: "border border-neutral-600 bg-neutral-200 font-bold text-neutral-900",
};

export function Badge({ variant = "outline", children }: BadgeProps) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-sm px-2 py-0.5 text-[11px] font-medium ${VARIANT_CLASS[variant]}`}
    >
      {children}
    </span>
  );
}