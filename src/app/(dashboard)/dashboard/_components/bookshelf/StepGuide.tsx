// src/app/(dashboard)/_components/bookshelf/StepGuide.tsx

export type StepItem = {
  step: string;
  title: string;
  description: string;
};

export function StepGuide({ steps }: { steps: StepItem[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3" aria-label="本棚の使い方">
      {steps.map((s, index) => (
        <div
          key={s.step}
          className="relative rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-bold tracking-tight">{s.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600">{s.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
