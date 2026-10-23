// src/app/(dashboard)/_components/analysis/CategoryDistributionPanel.tsx
import { Panel } from "../ui/Panel";
import { ProgressBar } from "../ui/ProgressBar";

type CategoryItem = { label: string; count: number };

export function CategoryDistributionPanel({ items }: { items: CategoryItem[] }) {
  const total = items.reduce((sum, i) => sum + i.count, 0);

  return (
    <Panel title="カテゴリ分布" description={`保存済み${total}冊 / 1冊につき1カテゴリ`}>
      <div className="space-y-4">
        {items.map((item) => {
          const percent = total === 0 ? 0 : (item.count / total) * 100;
          return (
            <ProgressBar
              key={item.label}
              label={item.label}
              percent={percent}
              valueLabel={`${item.count}冊 / ${percent.toFixed(1)}%`}
            />
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-3 text-sm font-bold">
        <span>合計 {total}冊</span>
        <span className="tabular-nums">{total === 0 ? "0.0" : "100.0"}%</span>
      </div>
    </Panel>
  );
}