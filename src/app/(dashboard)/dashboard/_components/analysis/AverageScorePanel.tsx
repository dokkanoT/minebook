// src/app/(dashboard)/_components/analysis/AverageScorePanel.tsx
import { Panel } from "../ui/Panel";

type Row = { label: string; average: number };

type AverageScorePanelProps = {
  rows: Row[];
  /** 全体平均 */
  overall: number;
  /** 横軸の下限・上限 */
  min: number;
  max: number;
};

export function AverageScorePanel({ rows, overall, min, max }: AverageScorePanelProps) {
  const toPercent = (value: number) =>
    Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const avgPercent = toPercent(overall);
  // rows は平均の高い順。先頭だけ濃い点で強調する
  const topLabel = rows[0]?.label;

  return (
    <Panel
      title="カテゴリ別の平均お宝度"
      description={`点の位置が平均スコア / 縦線は全体平均 ${overall.toFixed(1)}（例）`}
    >
      <div className="grid grid-cols-[4rem_1fr_3rem] gap-x-3">
        {/* カテゴリ名 */}
        <div>
          {rows.map((r) => (
            <div key={r.label} className="flex h-10 items-center text-sm font-bold">
              {r.label}
            </div>
          ))}
        </div>

        {/* ドットプロット */}
        <div className="relative">
          <div
            className="absolute inset-y-0 w-px bg-neutral-500"
            style={{ left: `${avgPercent}%` }}
            aria-hidden
          />
          {rows.map((r) => (
            <div key={r.label} className="relative h-10">
              <div className="absolute inset-x-0 top-1/2 h-px bg-neutral-300" aria-hidden />
              <span
                role="img"
                aria-label={`${r.label} 平均 ${r.average.toFixed(1)}`}
                className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                  r.label === topLabel ? "bg-neutral-900" : "bg-neutral-500"
                }`}
                style={{ left: `${toPercent(r.average)}%` }}
              />
            </div>
          ))}
        </div>

        {/* 数値 */}
        <div>
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex h-10 items-center justify-end text-sm font-bold tabular-nums"
            >
              {r.average.toFixed(1)}
            </div>
          ))}
        </div>

        {/* 軸ラベル */}
        <div />
        <div className="relative mt-2 h-4 text-[11px] text-neutral-600">
          <span className="absolute left-0">{min}</span>
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${avgPercent}%` }}
          >
            平均 {Math.round(overall)}
          </span>
          <span className="absolute right-0">{max}</span>
        </div>
        <div />
      </div>
    </Panel>
  );
}