// src/app/(dashboard)/_components/ranking/ScoreExplanationPanel.tsx
import { Panel } from "../ui/Panel";

type Criterion = { title: string; description: string };

type ScoreExplanationPanelProps = {
  description: string;
  criteria: Criterion[];
  pendingTitle: string;
  pendingBody: string;
  footnote: string;
};

export function ScoreExplanationPanel({
  description,
  criteria,
  pendingTitle,
  pendingBody,
  footnote,
}: ScoreExplanationPanelProps) {
  return (
    <Panel title="お宝とは" description={description}>
      <ul>
        {criteria.map((c) => (
          <li key={c.title} className="border-b border-neutral-200 py-3">
            <p className="text-sm font-bold">{c.title}</p>
            <p className="mt-1 text-xs text-neutral-600">{c.description}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-sm bg-neutral-100 p-4">
        <p className="text-xs font-bold">{pendingTitle}</p>
        <p className="mt-2 text-xs leading-relaxed text-neutral-600">{pendingBody}</p>
      </div>

      <p className="mt-4 text-xs text-neutral-600">{footnote}</p>
    </Panel>
  );
}