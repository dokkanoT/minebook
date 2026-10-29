// src/app/(dashboard)/_components/ui/BarTrack.tsx
type BarTrackProps = {
  /** 0〜100 */
  percent: number;
  label: string;
  className?: string;
};

export function BarTrack({ percent, label, className = "h-2.5" }: BarTrackProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 10) / 10}
      className={`w-full bg-neutral-200 ${className}`}
    >
      <div className="h-full bg-neutral-600" style={{ width: `${clamped}%` }} />
    </div>
  );
}