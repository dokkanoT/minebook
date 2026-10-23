// src/app/(dashboard)/_components/analysis/TagUsagePanel.tsx
import { ArrowLink } from "../ui/ArrowLink";
import { Badge } from "../ui/Badge";
import { BarTrack } from "../ui/BarTrack";
import { Panel } from "../ui/Panel";

type TagCount = { label: string; count: number };

type TagUsagePanelProps = {
  tags: TagCount[];
  registeredCount: number;
};

export function TagUsagePanel({ tags, registeredCount }: TagUsagePanelProps) {
  const max = Math.max(...tags.map((t) => t.count), 1);

  return (
    <Panel
      title="よく付けるタグ"
      description={`1冊に複数付与あり / 登録タグ${registeredCount}件`}
      className="flex h-full flex-col"
    >
      <ul className="space-y-4">
        {tags.map((tag) => (
          <li key={tag.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0">
              <Badge>{tag.label}</Badge>
            </span>
            <div className="flex-1">
              <BarTrack percent={(tag.count / max) * 100} label={tag.label} />
            </div>
            <span className="w-10 text-right text-sm font-bold tabular-nums">{tag.count}冊</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <ArrowLink href="/collection">コレクションでタグを管理</ArrowLink>
      </div>
    </Panel>
  );
}