// src/app/(dashboard)/_components/bookshelf/MyShelvesPanel.tsx
import { OutlineButton } from "../ui/OutlineButton";
import { Panel } from "../ui/Panel";
import { DropSlot } from "./DropSlot";
import { ShelfCard, type ShelfView } from "./ShelfCard";

export function MyShelvesPanel({ shelves }: { shelves: ShelfView[] }) {
  return (
    <Panel
      title="マイ本棚"
      description="本をドラッグして配置、棚内で並び替え"
      action={<OutlineButton size="sm">＋ 本棚を作成</OutlineButton>}
    >
      <div className="space-y-4">
        {shelves.map((shelf) => {
          const empty = shelf.books.length === 0;
          return (
            <ShelfCard
              key={shelf.id}
              shelf={shelf}
              aside={empty ? <OutlineButton size="sm">削除</OutlineButton> : undefined}
            >
              {empty && (
                <DropSlot
                  title="ここに本をドロップ"
                  description="ドロップ、または「本棚に追加」で配置できます"
                />
              )}
            </ShelfCard>
          );
        })}
      </div>
    </Panel>
  );
}