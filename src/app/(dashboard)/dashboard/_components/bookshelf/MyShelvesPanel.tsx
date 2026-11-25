// src/app/(dashboard)/_components/bookshelf/MyShelvesPanel.tsx
import { useState, type DragEventHandler } from "react";
import { Plus, Trash2 } from "lucide-react";
import { OutlineButton } from "@/components/ui/OutlineButton";
import { Panel } from "@/components/ui/Panel";
import { ShelfCard, type ShelfView } from "./ShelfCard";
import type { TileBook } from "./BookTile";

type MyShelvesPanelProps = {
  shelves: ShelfView[];
  onDropBook?: (shelfId: string, bookId: string, beforeBookId?: string) => void;
  onDragStart?: DragEventHandler<HTMLElement>;
  onDragEnd?: DragEventHandler<HTMLElement>;
  draggingBookId?: string | null;
  onCreateShelf?: () => void;
  onBookClick?: (book: TileBook) => void;
  onDeleteShelf?: (shelf: ShelfView) => void;
};

export function MyShelvesPanel({
  shelves,
  onDropBook,
  onDragStart,
  onDragEnd,
  draggingBookId = null,
  onCreateShelf,
  onBookClick,
  onDeleteShelf,
}: MyShelvesPanelProps) {
  const [activeShelfId, setActiveShelfId] = useState<string | null>(null);
  const [sortByShelf, setSortByShelf] = useState<Record<string, "manual" | "score" | "author">>({});

  return (
    <Panel
      title="マイ本棚"
      description="本を置きたい棚へドラッグしてください"
      action={
        <OutlineButton size="sm" className="gap-1.5" onClick={onCreateShelf}>
          <Plus className="h-3.5 w-3.5" aria-hidden />
          棚を作成
        </OutlineButton>
      }
      className="shadow-sm"
    >
      <div className="space-y-3">
        {shelves.map((shelf) => {
          const sort = sortByShelf[shelf.id] ?? "manual";
          const sortedShelf = {
            ...shelf,
            books: [...shelf.books].sort((left, right) => {
              if (sort === "score") return right.score - left.score;
              if (sort === "author") return left.author.localeCompare(right.author, "ja");
              return 0;
            }),
          };
          return (
            <ShelfCard
              key={shelf.id}
              shelf={sortedShelf}
              highlight={activeShelfId === shelf.id}
              aside={
                <div className="flex shrink-0 items-center gap-2">
                  <label className="flex items-center gap-1 text-[10px] text-neutral-500">
                    並び
                    <select
                      value={sort}
                      onChange={(event) => setSortByShelf((current) => ({ ...current, [shelf.id]: event.target.value as "manual" | "score" | "author" }))}
                      className="h-7 rounded-sm border border-neutral-300 bg-white px-1.5 text-[10px] text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                      aria-label={`${shelf.name}の並び順`}
                    >
                      <option value="manual">手動</option>
                      <option value="score">お宝度順</option>
                      <option value="author">著者順</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => onDeleteShelf?.(shelf)}
                    aria-label={`${shelf.name}を削除`}
                    title="棚を削除"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-neutral-500 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              }
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              draggingBookId={draggingBookId}
              onBookClick={onBookClick}
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
                const targetBookId = (event.target as HTMLElement)
                  .closest<HTMLElement>("[data-book-id]")
                  ?.dataset.bookId;
                setActiveShelfId(null);
                if (bookId) {
                  const isReordering = shelf.books.some((book) => book.id === bookId);
                  if (isReordering && sort !== "manual") {
                    setSortByShelf((current) => ({ ...current, [shelf.id]: "manual" }));
                  }
                  onDropBook?.(shelf.id, bookId, targetBookId);
                }
              }}
            />
          );
        })}
      </div>
    </Panel>
  );
}
