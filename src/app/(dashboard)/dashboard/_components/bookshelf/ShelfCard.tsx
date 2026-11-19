// src/app/(dashboard)/_components/bookshelf/ShelfCard.tsx
import type { ReactNode } from "react";
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
};

export function ShelfCard({
  shelf,
  highlight = false,
  tileCover = "short",
  aside,
  children,
  footer,
}: ShelfCardProps) {
  return (
    <section
      className={`rounded-sm p-4 ${
        highlight
          ? "border-2 border-dashed border-neutral-600 bg-neutral-50"
          : "border border-neutral-300 bg-white"
      }`}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-bold">{shelf.name}</h3>
          <span className="text-xs text-neutral-600">{shelf.books.length}冊</span>
        </div>
        {aside}
      </header>

      {shelf.books.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {shelf.books.map((book) => (
            <BookTile key={book.id} book={book} cover={tileCover} handle />
          ))}
        </div>
      )}

      {children}
      {footer}
    </section>
  );
}