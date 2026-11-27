// src/app/(dashboard)/_components/bookshelf/BookPool.tsx
"use client";

import { useMemo, useState, type DragEventHandler } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { BOOK_STATUS, BookTile, type BookStatus, type TileBook } from "./BookTile";

export type PoolBook = TileBook & {
  /** いずれかの棚に置かれているか */
  placed: boolean;
};

type PlacementFilter = "all" | "unplaced" | "placed";
type StatusFilter = "all" | BookStatus | "none";

const STATUS_OPTIONS = Object.entries(BOOK_STATUS) as [BookStatus, { label: string }][];

type BookPoolProps = {
  books: PoolBook[];
  categories: readonly string[];
  onDragStart?: DragEventHandler<HTMLElement>;
  onDragEnd?: DragEventHandler<HTMLElement>;
  onDropBook?: (bookId: string) => void;
  dropActive?: boolean;
};

const FIELD_CLASS =
  "h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm transition-colors placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

export function BookPool({
  books,
  categories,
  onDragStart,
  onDragEnd,
  onDropBook,
  dropActive = false,
}: BookPoolProps) {
  const [placement, setPlacement] = useState<PlacementFilter>("unplaced");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const counts = useMemo(
    () => ({
      all: books.length,
      unplaced: books.filter((b) => !b.placed).length,
      placed: books.filter((b) => b.placed).length,
    }),
    [books],
  );

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return books.filter(
      (b) =>
        (placement === "all" || (placement === "placed" ? b.placed : !b.placed)) &&
        (category === "all" || b.category === category) &&
        (status === "all" || (status === "none" ? !b.status : b.status === status)) &&
        (q === "" || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)),
    );
  }, [books, placement, keyword, category, status]);

  const tabs: { value: PlacementFilter; label: string }[] = [
    { value: "all", label: "すべて" },
    { value: "unplaced", label: "未配置" },
    { value: "placed", label: "配置済み" },
  ];

  return (
    <Panel
      title="収集プール"
      action={
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
          未配置の本を整理
        </span>
      }
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
        className={`rounded-md transition-colors ${dropActive ? "ring-2 ring-neutral-900 ring-offset-2" : ""}`}
      >
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-neutral-100 p-1">
        {tabs.map((tab) => {
          const active = placement === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setPlacement(tab.value)}
              aria-pressed={active}
              className={`rounded-md border px-3 py-2.5 text-left transition-all ${
                active ? "border-neutral-900 bg-white text-neutral-900 shadow-sm" : "border-transparent bg-transparent text-neutral-600 hover:bg-white/80"
              }`}
            >
              <span className="block text-xs text-neutral-700">{tab.label}</span>
              <span className="mt-1 block text-sm font-bold tabular-nums">{counts[tab.value]}冊</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <label className="relative block sm:col-span-2">
          <span className="sr-only">タイトル・著者で検索</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden />
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="タイトル・著者で検索"
            className={`${FIELD_CLASS} w-full pl-9`}
          />
        </label>
        <label className="relative block">
          <span className="sr-only">カテゴリで絞り込む</span>
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${FIELD_CLASS} w-full pl-9`}
          >
            <option value="all">カテゴリ：すべて</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="relative block">
          <span className="sr-only">ステータスで絞り込む</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className={`${FIELD_CLASS} w-full`}
          >
            <option value="all">ステータス：すべて</option>
            {STATUS_OPTIONS.map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
            <option value="none">未選択</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-xs text-neutral-500">条件に一致する本はありません。</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((book) => (
            <BookTile
              key={book.id}
              book={book}
              handle={!book.placed}
              draggable={Boolean(!book.placed && onDragStart)}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              badge={
                book.placed ? (
                  <Badge variant="muted">配置済み</Badge>
                ) : (
                  <Badge variant="outline">未配置</Badge>
                )
              }
            />
          ))}
        </div>
      )}
      </div>
    </Panel>
  );
}
