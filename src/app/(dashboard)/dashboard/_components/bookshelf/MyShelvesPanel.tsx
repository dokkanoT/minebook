// src/app/(dashboard)/_components/bookshelf/MyShelvesPanel.tsx
import { useState, type DragEventHandler } from "react";
import { Archive, Plus } from "lucide-react";
import { OutlineButton } from "@/components/ui/OutlineButton";
import { Panel } from "@/components/ui/Panel";
import { DropSlot } from "./DropSlot";
import { ShelfCard, type ShelfView } from "./ShelfCard";

type MyShelvesPanelProps = {
  shelves: ShelfView[];
  onDropBook?: (shelfId: string, bookId: string) => void;
  onDragStart?: DragEventHandler<HTMLElement>;
  onDragEnd?: DragEventHandler<HTMLElement>;
  onCreateShelf?: () => void;
  onDeleteShelf?: (shelfId: string) => void;
  /** 保存中はボタンを押せなくする */
  busy?: boolean;
};

export function MyShelvesPanel({
  shelves,
  onDropBook,
  onDragStart,
  onDragEnd,
  onCreateShelf,
  onDeleteShelf,
  busy = false,
}: MyShelvesPanelProps) {
  const [activeShelfId, setActiveShelfId] = useState<string | null>(null);

  return (
    <Panel
      title="マイ本棚"
      description="本を置きたい棚へドラッグしてください"
      action={
        <OutlineButton
          size="sm"
          className="gap-1.5"
          onClick={onCreateShelf}
          disabled={busy || !onCreateShelf}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          棚を作成
        </OutlineButton>
      }
      className="shadow-sm"
    >
      <div className="mb-4 flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-2 text-xs text-neutral-600">
        <Archive className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />
        <span>棚の中の背表紙もドラッグして移動できます</span>
      </div>
      <div className="space-y-4">
        {shelves.length === 0 && (
          <DropSlot
            title="まだ本棚がありません"
            description="「棚を作成」から、最初の本棚を作ってください"
          />
        )}
        {shelves.map((shelf) => {
          const empty = shelf.books.length === 0;
          return (
            <ShelfCard
              key={shelf.id}
              shelf={shelf}
              highlight={activeShelfId === shelf.id}
              aside={
                empty ? (
                  <OutlineButton
                    size="sm"
                    onClick={() => onDeleteShelf?.(shelf.id)}
                    disabled={busy || !onDeleteShelf}
                  >
                    削除
                  </OutlineButton>
                ) : undefined
              }
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={(event) => {
                if (!onDropBook) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setActiveShelfId(shelf.id);
              }}
              onDragLeave={() => setActiveShelfId(null)}
              onDrop={(event) => {
                event.preventDefault();
                const bookId = event.dataTransfer.getData("text/plain");
                setActiveShelfId(null);
                if (bookId) onDropBook?.(shelf.id, bookId);
              }}
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
