import type { ReactNode } from "react";
import { Panel } from "@/components/ui/Panel";

type StatCardProps = { label: string; value: string; unit?: string; badge?: ReactNode; aside?: ReactNode; note?: string; children?: ReactNode };

export function StatCard({ label, value, unit, badge, aside, note, children }: StatCardProps) {
  return <Panel compact><p className="text-xs text-neutral-600">{label}</p><div className="mt-2 flex items-end justify-between gap-2"><p className="flex items-baseline gap-1.5"><span className="text-3xl font-bold leading-none tabular-nums">{value}</span>{unit && <span className="text-sm font-bold">{unit}</span>}{badge}</p>{aside}</div>{children}{note && <p className="mt-2 text-xs text-neutral-600">{note}</p>}</Panel>;
}
