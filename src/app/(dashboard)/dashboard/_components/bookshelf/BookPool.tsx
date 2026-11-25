"use client";

import { useMemo, useState, type DragEventHandler } from "react";
import { GripVertical, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { BookTile, type TileBook } from "./BookTile";

export type PoolBook = TileBook & {
  /** いずれかの棚に置かれているか */
  placed: boolean;
};

type PlacementFilter = "all" | "unplaced";

type BookPoolProps = {
  books: PoolBook[];
  shelves: { id: string; name: string }[];
  onDragStart?: DragEventHandler<HTMLElement>;
  onDragEnd?: DragEventHandler<HTMLElement>;
  onDropBook?: (bookId: string) => void;
  onQuickAdd?: (bookId: string, shelfId: string) => void;
  dropActive?: boolean;
  draggingBookId?: string | null;
};

const FIELD_CLASS =
  "h-9 rounded-sm border border-neutral-300 bg-white px-3 text-xs transition-colors placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

export function BookPool({
  books,
  shelves,
  onDragStart,
  onDragEnd,
  onDropBook,
  onQuickAdd,
  dropActive = false,
  draggingBookId = null,
}: BookPoolProps) {
  const [placement, setPlacement] = useState<PlacementFilter>("unplaced");
  const [keyword, setKeyword] = useState("");
  const [quickAddBookId, setQuickAddBookId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: books.length,
      unplaced: books.filter((book) => !book.placed).length,
    }),
    [books],
  );

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return books.filter(
      (book) =>
        (placement === "all" || !book.placed) &&
        (query === "" ||
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query)),
    );
  }, [books, placement, keyword]);

  const tabs: { value: PlacementFilter; label: string }[] = [
    { value: "unplaced", label: "未配置" },
    { value: "all", label: "すべて" },
  ];

  return (
    <Panel
      title="収集プール"
      action={<span className="text-[11px] text-neutral-500">スキャンで集めた本</span>}
      className="shadow-sm"
    >
      <div
        onDragOver={(event) => {
          if (onDropBook) event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          const bookId = event.dataTransfer.getData("text/plain");
          if (bookId) onDropBook?.(bookId);
        }}
        className={`rounded-sm transition-colors ${dropActive ? "ring-2 ring-neutral-900 ring-offset-2" : ""}`}
      >
        <div className="grid grid-cols-2 gap-1 rounded-sm bg-neutral-100 p-1">
          {tabs.map((tab) => {
            const active = placement === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setPlacement(tab.value)}
                aria-pressed={active}
                className={`flex items-center justify-between rounded-sm px-2.5 py-2 text-xs transition-colors ${
                  active
                    ? "bg-neutral-900 font-semibold text-white"
                    : "text-neutral-600 hover:bg-white"
                }`}
              >
                <span>{tab.label}</span>
                <span className="tabular-nums">{counts[tab.value]}冊</span>
              </button>
            );
          })}
        </div>

        <label className="relative mt-2 block">
          <span className="sr-only">タイトル・著者で検索</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" aria-hidden />
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="タイトル・著者で検索"
            className={`${FIELD_CLASS} w-full pl-8`}
          />
        </label>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-xs text-neutral-500">条件に一致する本はありません。</p>
        ) : (
          <div className="mt-2 max-h-[34rem] space-y-1.5 overflow-y-auto pr-1">
            {filtered.map((book) => (
              <div key={book.id} className="relative">
                <BookTile
                  book={book}
                  state={draggingBookId === book.id ? "dragging" : "default"}
                  variant="row"
                  handle
                  draggable={Boolean(!book.placed && onDragStart)}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  badge={
                    book.placed ? (
                      <Badge variant="muted">配置済み</Badge>
                    ) : (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setQuickAddBookId((current) => current === book.id ? null : book.id)}
                          className="rounded-sm border border-neutral-300 bg-white px-2 py-1.5 text-[10px] font-semibold text-neutral-700 transition-colors hover:border-neutral-900 hover:bg-neutral-50"
                          aria-expanded={quickAddBookId === book.id}
                        >
                          棚に置く
                        </button>
                        {quickAddBookId === book.id && (
                          <div className="absolute right-0 top-full z-30 mt-1 min-w-36 rounded-sm border border-neutral-200 bg-white p-1 shadow-lg">
                            {shelves.map((shelf) => (
                              <button
                                key={shelf.id}
                                type="button"
                                onClick={() => {
                                  onQuickAdd?.(book.id, shelf.id);
                                  setQuickAddBookId(null);
                                }}
                                className="block w-full rounded-sm px-2 py-1.5 text-left text-[11px] text-neutral-700 hover:bg-neutral-100"
                              >
                                {shelf.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }
                />
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-neutral-500">
          <GripVertical className="h-3 w-3" aria-hidden /> 本をつかんで右の棚へ移動
        </div>
      </div>
    </Panel>
  );
}
