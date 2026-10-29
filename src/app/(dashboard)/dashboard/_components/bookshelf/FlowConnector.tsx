// src/app/(dashboard)/_components/bookshelf/FlowConnector.tsx
import { ArrowRight } from "lucide-react";

/** ドラッグ元とドロップ先をつなぐ矢印とラベル */
export function FlowConnector({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-xs text-neutral-600" aria-hidden>
      <ArrowRight className="h-5 w-5" />
      <span>{label}</span>
    </div>
  );
}