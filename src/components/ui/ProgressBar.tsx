import { BarTrack } from "./BarTrack";

type ProgressBarProps = { label: string; rank?: number; percent: number; valueLabel: string; emphasizeValue?: boolean };

export function ProgressBar({ label, rank, percent, valueLabel, emphasizeValue = false }: ProgressBarProps) {
  return <div><div className="mb-1.5 flex items-baseline justify-between gap-2"><span className="text-sm font-bold">{rank !== undefined && <span className="mr-2 tabular-nums">{rank}</span>}{label}</span><span className={`text-xs tabular-nums ${emphasizeValue ? "font-bold text-neutral-900" : "text-neutral-600"}`}>{valueLabel}</span></div><BarTrack percent={percent} label={label} /></div>;
}
