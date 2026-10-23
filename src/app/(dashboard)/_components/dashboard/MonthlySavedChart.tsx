// src/app/(dashboard)/_components/dashboard/MonthlySavedChart.tsx
"use client";

import { useState } from "react";
import { Panel } from "../ui/Panel";

type MonthlyPoint = { label: string; count: number };
type Range = "6m" | "1y";

type MonthlySavedChartProps = {
  sixMonths: MonthlyPoint[];
  oneYear: MonthlyPoint[];
};

const RANGE_OPTIONS = [
  { value: "6m", label: "6か月" },
  { value: "1y", label: "1年" },
] as const;

export function MonthlySavedChart({ sixMonths, oneYear }: MonthlySavedChartProps) {
  const [range, setRange] = useState<Range>("6m");
  const data = range === "6m" ? sixMonths : oneYear;

  // 縦軸は 0〜4 の5目盛りで固定し、最大値に応じて刻み幅を変える
  const maxCount = Math.max(...data.map((d) => d.count), 4);
  const step = Math.ceil(maxCount / 4);
  const top = step * 4;
  const ticks = [0, 1, 2, 3, 4].map((n) => n * step);

  return (
    <Panel
      title="月別の保存冊数"
      description={`直近${range === "6m" ? "6か月" : "1年"} / 保存した日で集計`}
      className="h-full"
      action={
        <div className="flex overflow-hidden rounded-sm border border-neutral-900 text-xs font-bold">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRange(opt.value)}
              aria-pressed={range === opt.value}
              className={`px-4 py-1.5 ${
                range === opt.value ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="flex gap-3 pt-5">
        {/* 縦軸の目盛り */}
        <div className="relative h-44 w-4 text-[10px] text-neutral-600">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-0 translate-y-1/2 tabular-nums"
              style={{ bottom: `${(t / top) * 100}%` }}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex-1">
          <div className="relative h-44 border-b border-neutral-400">
            {ticks.slice(1).map((t) => (
              <div
                key={t}
                className="absolute inset-x-0 border-t border-neutral-200"
                style={{ bottom: `${(t / top) * 100}%` }}
              />
            ))}
            <div className="absolute inset-0 flex items-end justify-around px-2">
              {data.map((d, i) => (
                <div
                  key={`${d.label}-${i}`}
                  className="flex h-full max-w-14 flex-1 flex-col items-center justify-end px-1"
                >
                  <span className="mb-1 shrink-0 text-[11px] font-bold tabular-nums">{d.count}</span>
                  <div
                    className={`w-full shrink-0 ${
                      i === data.length - 1 ? "bg-neutral-900" : "bg-neutral-500"
                    }`}
                    style={{ height: `${(d.count / top) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex justify-around px-2 text-[11px] text-neutral-600">
            {data.map((d, i) => (
              <span key={`${d.label}-${i}`} className="max-w-14 flex-1 text-center">
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}