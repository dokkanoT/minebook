// src/app/(dashboard)/_components/bookshelf/StepGuide.tsx
import { Panel } from "../ui/Panel";

export type StepItem = {
  step: string;
  title: string;
  description: string;
};

export function StepGuide({ steps }: { steps: StepItem[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {steps.map((s) => (
        <Panel key={s.step} compact>
          <p className="text-[11px] text-neutral-500">{s.step}</p>
          <p className="mt-1 text-sm font-bold">{s.title}</p>
          <p className="mt-1 text-xs text-neutral-600">{s.description}</p>
        </Panel>
      ))}
    </div>
  );
}