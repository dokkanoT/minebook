// src/app/(dashboard)/_components/dashboard/MiniDonut.tsx
const SHADES = ["#262626", "#737373", "#a3a3a3", "#d4d4d4"];

type MiniDonutProps = {
  values: number[];
  label: string;
};

export function MiniDonut({ values, label }: MiniDonutProps) {
  const total = values.reduce((sum, v) => sum + v, 0) || 1;
  const stops = values
    .reduce<{ end: number; stops: string[] }>(
      (state, value, i) => {
        const start = state.end;
        const end = start + (value / total) * 360;
        return {
          end,
          stops: [...state.stops, `${SHADES[i % SHADES.length]} ${start}deg ${end}deg`],
        };
      },
      { end: 0, stops: [] },
    )
    .stops.join(", ");

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
