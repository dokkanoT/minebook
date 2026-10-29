// src/app/(dashboard)/_components/history/ScanCalendar.tsx
import { Panel } from "../ui/Panel";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

type ScanCalendarProps = {
  year: number;
  /** 1〜12 */
  month: number;
  /** 日 → スキャン冊数 */
  counts: Record<number, number>;
};

function levelClass(count: number) {
  if (count >= 2) return "bg-neutral-800 font-bold text-white";
  if (count === 1) return "bg-neutral-400 font-bold text-neutral-900";
  return "bg-neutral-200 text-neutral-600";
}

export function ScanCalendar({ year, month, counts }: ScanCalendarProps) {
  const leadingBlanks = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Panel compact>
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-bold">スキャンした日</h2>
        <span className="text-xs text-neutral-600">
          {year}年{month}月
        </span>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-[11px] text-neutral-600">
            {w}
          </span>
        ))}
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <span key={`blank-${i}`} aria-hidden />
        ))}
        {days.map((day) => {
          const count = counts[day] ?? 0;
          return (
            <span
              key={day}
              title={count > 0 ? `${month}/${day}：${count}冊` : undefined}
              className={`flex h-6 items-center justify-center rounded-sm text-[11px] tabular-nums ${levelClass(count)}`}
            >
              {day}
            </span>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-neutral-600">
        <span>少</span>
        <span className="h-2.5 w-2.5 bg-neutral-200" />
        <span className="h-2.5 w-2.5 bg-neutral-400" />
        <span className="h-2.5 w-2.5 bg-neutral-800" />
        <span>多</span>
      </div>
    </Panel>
  );
}