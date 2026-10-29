// src/app/(dashboard)/_components/collection/CollectionList.tsx
import { Folder } from "lucide-react";
import { OutlineButton } from "../ui/OutlineButton";
import { Panel } from "../ui/Panel";

type CollectionListItem = { id: string; name: string; count: number };

type CollectionListProps = {
  items: CollectionListItem[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function CollectionList({ items, selectedId, onSelect }: CollectionListProps) {
  return (
    <Panel title="コレクション一覧">
      <ul className="space-y-3">
        {items.map((item) => {
          const selected = item.id === selectedId;
          return (
            <li
              key={item.id}
              className={`rounded-sm border p-3 ${
                selected ? "border-neutral-600 bg-neutral-200" : "border-neutral-300 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-pressed={selected}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <span className="flex items-center gap-2 text-sm font-bold">
                  <Folder className="h-4 w-4 shrink-0" aria-hidden />
                  {item.name}
                </span>
                <span className="text-xs tabular-nums">{item.count}冊</span>
              </button>

              <div className="mt-3 flex items-center gap-2">
                <OutlineButton size="sm">編集</OutlineButton>
                <OutlineButton size="sm">削除</OutlineButton>
                {selected && <span className="text-xs text-neutral-600">選択中</span>}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs leading-relaxed text-neutral-600">
        削除時は確認を表示する想定です。コレクションを削除しても、本棚の書籍は残ります。
      </p>
    </Panel>
  );
}