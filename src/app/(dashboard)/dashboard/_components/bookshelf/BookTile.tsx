// src/app/(dashboard)/_components/bookshelf/BookTile.tsx
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

export type TileBook = {
  id: string;
  title: string;
  author: string;
  category: string;
  score: number;
};

/** default: 通常 / dragging: ドラッグ中 / selected: 選択中 */
export type TileState = "default" | "dragging" | "selected";
type CoverSize = "short" | "tall";

const STATE_CLASS: Record<TileState, string> = {
  default: "border border-neutral-300 bg-white",
  dragging: "-rotate-2 border-2 border-neutral-900 bg-white shadow-lg",
  selected: "border-2 border-neutral-900 bg-white",
};

const COVER_CLASS: Record<CoverSize, string> = {
  short: "h-14",
  tall: "h-24",
};

type BookTileProps = {
  book: TileBook;
  state?: TileState;
  cover?: CoverSize;
  badge?: ReactNode;
  /** つまめることを示すグリップを表示する */
  handle?: boolean;
};

export function BookTile({
  book,
  state = "default",
  cover = "short",
  badge,
  handle = false,
}: BookTileProps) {
  return (
    <article className={`rounded-sm p-2 ${STATE_CLASS[state]} ${handle ? "cursor-grab" : ""}`}>
      <div className={`relative flex items-center justify-center bg-neutral-200 ${COVER_CLASS[cover]}`}>
        {handle && (
          <GripVertical
            className="absolute right-0.5 top-0.5 h-3.5 w-3.5 text-neutral-500"
            aria-hidden
          />
        )}
        <div className="flex aspect-[2/3] h-4/5 items-center justify-center border border-neutral-300 bg-neutral-100 text-[9px] text-neutral-500">
          書影
        </div>
      </div>
      <h3 className="mt-2 truncate text-xs font-bold">{book.title}</h3>
      <p className="mt-0.5 truncate text-[11px] text-neutral-600">{book.author}</p>
      <p className="mt-0.5 flex items-center justify-between gap-1 text-[11px] text-neutral-600">
        <span className="truncate">{book.category}</span>
        <span className="shrink-0 font-bold text-neutral-900">お宝度 {book.score}</span>
      </p>
      {badge && <div className="mt-2">{badge}</div>}
    </article>
  );
}