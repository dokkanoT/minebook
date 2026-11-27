// src/app/(dashboard)/_components/bookshelf/MyShelvesPanel.tsx
import { useState, type DragEventHandler } from "react";
import { Expand, Minimize2, Plus, Trash2 } from "lucide-react";
import { OutlineButton } from "@/components/ui/OutlineButton";
import { Panel } from "@/components/ui/Panel";
import { buildDefaultBookLocations, ShelfCard, type ShelfBookLocation, type ShelfView } from "./ShelfCard";
import type { TileBook } from "./BookTile";

type MyShelvesPanelProps = {
  shelves: ShelfView[];
  onDropBook?: (
    shelfId: string,
    bookId: string,
    beforeBookId?: string,
    location?: ShelfBookLocation,
    displayedLocations?: Record<string, ShelfBookLocation>,
  ) => void;
  onDragStart?: DragEventHandler<HTMLElement>;
  onDragEnd?: DragEventHandler<HTMLElement>;
  draggingBookId?: string | null;
  onCreateShelf?: () => void;
  onBookClick?: (book: TileBook) => void;
  onDeleteShelf?: (shelf: ShelfView) => void;
  rowCountByShelf?: Record<string, number>;
  onChangeRowCount?: (
    shelfId: string,
    rowCount: number,
    displayedLocations: Record<string, ShelfBookLocation>,
    displayedBooks: TileBook[],
  ) => void;
  dividerPositionsByShelf?: Record<string, number[][]>;
  bookLocationsByShelf?: Record<string, Record<string, ShelfBookLocation>>;
  onAddDivider?: (shelfId: string, row: number) => void;
  onMoveDivider?: (shelfId: string, row: number, index: number, position: number) => void;
  onRemoveDivider?: (shelfId: string, row: number, index: number) => void;
  fullScreenShelfId?: string | null;
  onToggleFullScreen?: (shelfId: string) => void;
  fullScreen?: boolean;
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
  rowCountByShelf = {},
  onChangeRowCount,
  dividerPositionsByShelf = {},
  bookLocationsByShelf = {},
  onAddDivider,
  onMoveDivider,
  onRemoveDivider,
  fullScreenShelfId = null,
  onToggleFullScreen,
  fullScreen = false,
}: MyShelvesPanelProps) {
  const [activeShelfId, setActiveShelfId] = useState<string | null>(null);
  const [activeDropCell, setActiveDropCell] = useState<{ shelfId: string; row: number; compartment: number } | null>(null);
  const [sortByShelf, setSortByShelf] = useState<Record<string, "manual" | "score" | "author">>({});

  return (
    <Panel
      title="マイ本棚"
      description={fullScreen ? "Escキーまたは「通常表示」で戻れます" : "本を置きたい棚へドラッグしてください"}
      action={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {!fullScreen && (
            <OutlineButton size="sm" className="gap-1.5" onClick={onCreateShelf}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              棚を作成
            </OutlineButton>
          )}
        </div>
      }
      className={fullScreen ? "flex h-full min-h-0 min-w-0 flex-col shadow-sm" : "min-w-0 shadow-sm"}
    >
      <div className={fullScreen ? "min-h-0 flex-1 space-y-3 overflow-y-auto pr-1" : "space-y-3"}>
        {shelves.map((shelf) => {
          const sort = sortByShelf[shelf.id] ?? "manual";
          const rowCount = rowCountByShelf[shelf.id] ?? 1;
          const dividerPositions = dividerPositionsByShelf[shelf.id] ?? [];
          const isFullScreen = fullScreenShelfId === shelf.id;
          const sortedShelf = {
            ...shelf,
            books: [...shelf.books].sort((left, right) => {
              if (sort === "score") return right.score - left.score;
              if (sort === "author") return left.author.localeCompare(right.author, "ja");
              return 0;
            }),
          };
          const bookLocations = {
            ...buildDefaultBookLocations(sortedShelf.books, rowCount, dividerPositions),
            ...(bookLocationsByShelf[shelf.id] ?? {}),
          };
          return (
            <ShelfCard
              key={shelf.id}
              shelf={sortedShelf}
              rowCount={rowCount}
              dividerPositionsByRow={dividerPositions}
              bookLocations={bookLocations}
              activeDropTarget={activeDropCell?.shelfId === shelf.id ? activeDropCell : null}
              onMoveDivider={(row, index, position) => onMoveDivider?.(shelf.id, row, index, position)}
              onRemoveDivider={(row, index) => onRemoveDivider?.(shelf.id, row, index)}
              onAddDivider={(row) => onAddDivider?.(shelf.id, row)}
              highlight={activeShelfId === shelf.id}
              aside={
                <div className="flex w-full min-w-0 flex-wrap items-center justify-start gap-1.5 sm:w-auto sm:flex-1 sm:justify-end">
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
                  <label className="flex h-9 items-center gap-1 rounded-sm border border-neutral-300 bg-white px-2 text-[11px] text-neutral-600">
                    段数
                    <select
                      value={rowCount}
                      onChange={(event) => onChangeRowCount?.(shelf.id, Number(event.target.value), bookLocations, sortedShelf.books)}
                      aria-label={`${shelf.name}の段数`}
                      className="max-w-12 bg-transparent font-medium text-neutral-800 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20"
                    >
                      {[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count}</option>)}
                    </select>
                  </label>
                  <button
                    type="button"
                    aria-label={isFullScreen ? `${shelf.name}を通常表示に戻す` : `${shelf.name}を全画面表示`}
                    title={isFullScreen ? "通常表示に戻す" : "全画面表示"}
                    onClick={() => onToggleFullScreen?.(shelf.id)}
                    className="inline-flex h-9 items-center gap-1 rounded-sm border border-neutral-300 bg-white px-2 text-[11px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20"
                  >
                    {isFullScreen ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Expand className="h-4 w-4" aria-hidden />}
                    <span className="hidden sm:inline">{isFullScreen ? "戻る" : "全画面"}</span>
                  </button>
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
                const section = (event.target as HTMLElement).closest<HTMLElement>("[data-row-section]");
                setActiveDropCell(section ? {
                  shelfId: shelf.id,
                  row: Number(section.dataset.rowIndex),
                  compartment: Number(section.dataset.sectionIndex),
                } : null);
              }}
              onDragLeave={(event) => {
                if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
                setActiveShelfId(null);
                setActiveDropCell(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const bookId = event.dataTransfer.getData("text/plain");
                const target = event.target as HTMLElement;
                const targetBookId = target.closest<HTMLElement>("[data-book-id]")?.dataset.bookId;
                const targetSection = target.closest<HTMLElement>("[data-row-section]");
                const location = targetSection
                  ? { row: Number(targetSection.dataset.rowIndex), compartment: Number(targetSection.dataset.sectionIndex) }
                  : targetBookId ? bookLocations[targetBookId] : undefined;
                setActiveShelfId(null);
                setActiveDropCell(null);
                if (bookId) {
                  const isReordering = shelf.books.some((book) => book.id === bookId);
                  if (isReordering && sort !== "manual") {
                    setSortByShelf((current) => ({ ...current, [shelf.id]: "manual" }));
                  }
                  onDropBook?.(shelf.id, bookId, targetBookId, location, bookLocations);
                }
              }}
            />
          );
        })}
      </div>
    </Panel>
  );
}
