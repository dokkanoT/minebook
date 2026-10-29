// src/app/(dashboard)/_components/ui/OutlineButton.tsx
import type { ButtonHTMLAttributes } from "react";

type OutlineButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  size?: "sm" | "md";
};

const SIZE_CLASS = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
} as const;

export function OutlineButton({ size = "md", className = "", ...props }: OutlineButtonProps) {
  return (
    <button
      type="button"
      className={`rounded-sm border border-neutral-300 bg-white font-medium transition-colors hover:bg-neutral-50 ${SIZE_CLASS[size]} ${className}`}
      {...props}
    />
  );
}