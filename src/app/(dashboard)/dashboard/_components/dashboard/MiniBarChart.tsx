// src/app/(dashboard)/_components/dashboard/MiniBarChart.tsx
type MiniBarChartProps = {
  values: number[];
  highlight?: "last" | "none";
  label: string;
};

export function MiniBarChart({ values, highlight = "none", label }: MiniBarChartProps) {
  const max = Math.max(...values, 1);

  return (
    <div role="img" aria-label={label} className="flex h-9 items-end gap-1">
      {values.map((v, i) => (
        <span
          key={i}
          className={`w-2 ${
            highlight === "last" && i === values.length - 1 ? "bg-neutral-900" : "bg-neutral-400"
          }`}
          style={{ height: `${Math.max(10, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}