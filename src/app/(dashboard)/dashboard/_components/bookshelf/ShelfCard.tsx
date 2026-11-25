// src/app/(dashboard)/_components/bookshelf/ShelfCard.tsx
import type { DragEventHandler, ReactNode } from "react";
import { BookTile, type TileBook } from "./BookTile";

export type ShelfView = {
  id: string;
  name: string;
  books: TileBook[];
  color?: "slate" | "rose" | "amber" | "emerald" | "sky" | "violet";
};

const SHELF_COLOR_CLASS = {
  slate: "bg-slate-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
} as const;

type ShelfCardProps = {
  shelf: ShelfView;
  /** ドロップ先として強調する */
  highlight?: boolean;
  tileCover?: "short" | "tall";
  /** ヘッダー右側（バッジ・ボタンなど） */
  aside?: ReactNode;
  /** 本の一覧の後ろに置く要素（ドロップ枠など） */
  children?: ReactNode;
  footer?: ReactNode;
  onDragOver?: DragEventHandler<HTMLElement>;
  onDragLeave?: DragEventHandler<HTMLElement>;
  onDrop?: DragEventHandler<HTMLElement>;
  onDragStart?: DragEventHandler<HTMLElement>;
  onDragEnd?: DragEventHandler<HTMLElement>;
  draggingBookId?: string | null;
  onBookClick?: (book: TileBook) => void;
};

export function ShelfCard({
  shelf,
  highlight = false,
  tileCover = "short",
  aside,
  children,
  footer,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  draggingBookId = null,
  onBookClick,
}: ShelfCardProps) {
  return (
    <section
      className={`rounded-sm p-4 ${
        highlight
          ? "border-2 border-dashed border-neutral-900 bg-neutral-50 shadow-md"
          : "border border-neutral-200 bg-white shadow-sm"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 truncate text-sm font-bold tracking-tight">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${SHELF_COLOR_CLASS[shelf.color ?? "slate"]}`} aria-hidden />
            {shelf.name}
          </h3>
          <p className="mt-0.5 text-[10px] text-neutral-500">
            {shelf.books.length}冊 ・ 平均お宝度 {shelf.books.length
              ? (shelf.books.reduce((sum, book) => sum + book.score, 0) / shelf.books.length).toFixed(1)
              : "—"}
          </p>
        </div>
        {aside}
      </header>

      <div className="relative flex min-h-48 items-end gap-1.5 overflow-x-auto rounded-sm border border-neutral-300 bg-neutral-200 px-3 pb-3 pt-4 shadow-inner">
        <div className="absolute inset-x-0 bottom-0 h-2 bg-neutral-800 shadow-[0_-1px_2px_rgba(0,0,0,0.12)]" aria-hidden />
        {shelf.books.map((book) => (
          <div key={book.id} className="relative z-10 flex shrink-0 flex-col items-center">
            <BookTile
              book={book}
              cover={tileCover}
              variant="spine"
              state={draggingBookId === book.id ? "dragging" : "default"}
              handle
              draggable={Boolean(onDragStart)}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onSelect={onBookClick}
            />
          </div>
        ))}
        {shelf.books.length === 0 && (
          <p className="mb-5 w-full text-center text-xs text-neutral-500">本をドラッグして棚に置く</p>
        )}
      </div>

      {children}
      {footer}
    </section>
  );
}
