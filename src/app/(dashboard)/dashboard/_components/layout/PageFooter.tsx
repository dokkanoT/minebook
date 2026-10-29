// src/app/(dashboard)/_components/layout/PageFooter.tsx
import type { ReactNode } from "react";

export function PageFooter({ children }: { children: ReactNode }) {
  return <footer className="mt-6 text-xs text-neutral-600">{children}</footer>;
}