// src/app/(dashboard)/_components/dashboard/MiniDonut.tsx
const SHADES = ["#262626", "#737373", "#a3a3a3", "#d4d4d4"];

type MiniDonutProps = {
  values: number[];
  label: string;
};

export function MiniDonut({ values, label }: MiniDonutProps) {
  const total = values.reduce((sum, v) => sum + v, 0) || 1;
  let acc = 0;
  const stops = values
    .map((v, i) => {
      const start = (acc / total) * 360;
      acc += v;
      const end = (acc / total) * 360;
      return `${SHADES[i % SHADES.length]} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div
      role="img"
      aria-label={label}
      className="relative h-11 w-11 shrink-0 rounded-full"
      style={{ background: `conic-gradient(${stops})` }}
    >
      <div className="absolute inset-[9px] rounded-full bg-white" />
    </div>
  );
}