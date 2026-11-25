// src/app/(dashboard)/_components/bookshelf/ShelfCard.tsx
import type { DragEventHandler, ReactNode } from "react";
import { BookTile, type TileBook } from "./BookTile";

export type ShelfView = {
  id: string;
  name: string;
  books: TileBook[];
};

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
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-bold tracking-tight">{shelf.name}</h3>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">{shelf.books.length}冊</span>
        </div>
        {aside}
      </header>

      {shelf.books.length > 0 && (
        <div className="relative flex min-h-40 items-end gap-2 overflow-x-auto rounded-md border border-neutral-200 bg-gradient-to-b from-neutral-100 to-neutral-200 p-4 shadow-inner">
          <div className="absolute inset-x-3 bottom-2 h-1 rounded-full bg-neutral-800/80" aria-hidden />
          {shelf.books.map((book) => (
            <BookTile
              key={book.id}
              book={book}
              cover={tileCover}
              variant="spine"
              handle
              draggable={Boolean(onDragStart)}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>
      )}

      {children}
      {footer}
    </section>
  );
}
