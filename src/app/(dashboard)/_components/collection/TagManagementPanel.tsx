// src/app/(dashboard)/_components/collection/TagManagementPanel.tsx
import { Badge } from "../ui/Badge";
import { OutlineButton } from "../ui/OutlineButton";
import { Panel } from "../ui/Panel";

export function TagManagementPanel({ tags }: { tags: string[] }) {
  return (
    <Panel title="タグ管理">
      <div className="flex items-start justify-between gap-4">
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag}>
              <Badge>{tag}</Badge>
            </li>
          ))}
        </ul>
        <OutlineButton>＋ タグを追加</OutlineButton>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <OutlineButton>タグ名を編集</OutlineButton>
        <OutlineButton>タグを削除</OutlineButton>
        <p className="text-xs text-neutral-600">
          登録タグ：{tags.length}件 / 本棚の書籍を整理するためのラベル
        </p>
      </div>
    </Panel>
  );
}