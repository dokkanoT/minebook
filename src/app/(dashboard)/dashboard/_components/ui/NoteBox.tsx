// src/app/(dashboard)/_components/ui/NoteBox.tsx
import type { ReactNode } from "react";

export function NoteBox({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-sm bg-neutral-100 p-3 text-xs leading-relaxed text-neutral-600">
      {children}
    </p>
  );
}