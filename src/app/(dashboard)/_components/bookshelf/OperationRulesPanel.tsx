// src/app/(dashboard)/_components/bookshelf/OperationRulesPanel.tsx
import { Panel } from "../ui/Panel";

export type RuleItem = {
  title: string;
  description: string;
};

export function OperationRulesPanel({ rules }: { rules: RuleItem[] }) {
  return (
    <Panel title="操作ルール">
      <div className="grid grid-cols-3 gap-4">
        {rules.map((rule) => (
          <div key={rule.title} className="rounded-sm bg-neutral-100 p-4">
            <p className="text-sm font-bold">{rule.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-600">{rule.description}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}