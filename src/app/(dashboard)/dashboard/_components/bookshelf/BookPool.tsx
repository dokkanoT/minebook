// src/app/(dashboard)/_components/bookshelf/BookPool.tsx
"use client";

import { useMemo, useState } from "react";
import { Badge } from "../ui/Badge";
import { Panel } from "../ui/Panel";
import { BookTile, type TileBook } from "./BookTile";

export type PoolBook = TileBook & {
  /** いずれかの棚に置かれているか */
  placed: boolean;
};

type PlacementFilter = "all" | "unplaced" | "placed";

type BookPoolProps = {
  books: PoolBook[];
  categories: readonly string[];
};

const FIELD_CLASS =
  "h-9 rounded-sm border border-neutral-300 bg-white px-3 text-sm focus:border-neutral-500 focus:outline-none";

export function BookPool({ books, categories }: BookPoolProps) {
  const [placement, setPlacement] = useState<PlacementFilter>("all");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");

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
        (q === "" || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)),
    );
  }, [books, placement, keyword, category]);

  const tabs: { value: PlacementFilter; label: string }[] = [
    { value: "all", label: "すべて" },
    { value: "unplaced", label: "未配置" },
    { value: "placed", label: "配置済み" },
  ];

  return (
    <Panel
      title="収集プール"
      action={
        <p className="text-xs text-neutral-600">スキャン済みの本をここから棚へドラッグ</p>
      }
    >
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const active = placement === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setPlacement(tab.value)}
              aria-pressed={active}
              className={`rounded-sm border px-3 py-2 text-left ${
                active ? "border-neutral-600 bg-neutral-200" : "border-neutral-300 bg-white hover:bg-neutral-50"
              }`}
            >
              <span className="block text-xs text-neutral-700">{tab.label}</span>
              <span className="mt-1 block text-sm font-bold tabular-nums">{counts[tab.value]}冊</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_12rem] gap-2">
        <label>
          <span className="sr-only">タイトル・著者で検索</span>
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="タイトル・著者で検索"
            className={`${FIELD_CLASS} w-full placeholder:text-neutral-500`}
          />
        </label>
        <label>
          <span className="sr-only">カテゴリで絞り込む</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${FIELD_CLASS} w-full`}
          >
            <option value="all">カテゴリ：すべて</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-xs text-neutral-500">条件に一致する本はありません。</p>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-3 2xl:grid-cols-6">
          {filtered.map((book) => (
            <BookTile
              key={book.id}
              book={book}
              handle={!book.placed}
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
    </Panel>
  );
}