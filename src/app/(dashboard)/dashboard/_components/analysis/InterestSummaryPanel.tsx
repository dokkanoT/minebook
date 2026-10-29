// src/app/(dashboard)/_components/analysis/InterestSummaryPanel.tsx
import { NoteBox } from "../ui/NoteBox";
import { Panel } from "../ui/Panel";

type InterestSummaryPanelProps = {
  headline: string;
  body: string;
  note: string;
};

export function InterestSummaryPanel({ headline, body, note }: InterestSummaryPanelProps) {
  return (
    <Panel title="集めた本から見える関心">
      <p className="text-xl font-bold">{headline}</p>
      <p className="mt-4 text-sm leading-relaxed text-neutral-700">{body}</p>
      <div className="mt-5">
        <NoteBox>{note}</NoteBox>
      </div>
    </Panel>
  );
}