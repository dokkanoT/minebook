// src/app/(dashboard)/_components/bookshelf/BookTile.tsx
import { GripVertical } from "lucide-react";
import type { DragEventHandler, ReactNode } from "react";

export type TileBook = {
  id: string;
  title: string;
  author: string;
  category: string;
  /** お宝度。まだ計算していない本は null */
  score: number | null;
  /** 購入・保留・見送り。未選択は null */
  status?: BookStatus | null;
};

export type BookStatus = "purchased" | "pending" | "skip";

/** ステータスの表示名と色（スマホのホームのバッジと揃える） */
export const BOOK_STATUS: Record<BookStatus, { label: string; className: string }> = {
  purchased: { label: "購入済", className: "border-emerald-300 bg-emerald-100 text-emerald-800" },
  pending: { label: "保留中", className: "border-amber-300 bg-amber-100 text-amber-800" },
  skip: { label: "見送り", className: "border-neutral-300 bg-neutral-100 text-neutral-600" },
};

function StatusBadge({ status }: { status: BookStatus }) {
  const { label, className } = BOOK_STATUS[status];
  return (
    <span className={`inline-block whitespace-nowrap rounded-sm border px-2 py-0.5 text-[11px] font-bold ${className}`}>
      {label}
    </span>
  );
}

const formatScore = (score: number | null) => (score === null ? "—" : String(score));

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
  variant?: "card" | "spine";
  badge?: ReactNode;
  /** つまめることを示すグリップを表示する */
  handle?: boolean;
  draggable?: boolean;
  onDragStart?: DragEventHandler<HTMLElement>;
  onDragEnd?: DragEventHandler<HTMLElement>;
};

export function BookTile({
  book,
  state = "default",
  cover = "short",
  variant = "card",
  badge,
  handle = false,
  draggable = false,
  onDragStart,
  onDragEnd,
}: BookTileProps) {
  const dragProps = {
    draggable,
    "data-book-id": book.id,
    onDragStart,
    onDragEnd,
  };

  if (variant === "spine") {
    return (
      <article
        {...dragProps}
        aria-label={`${book.title}、${book.author}、${book.category}、お宝度${formatScore(book.score)}${book.status ? `、${BOOK_STATUS[book.status].label}` : ""}`}
        title={book.status ? `${book.title}（${BOOK_STATUS[book.status].label}）` : book.title}
        className={`relative flex h-36 w-12 shrink-0 flex-col items-center justify-between rounded-t-sm border px-1.5 py-2 shadow-sm transition-transform ${
          state === "dragging" ? "-rotate-2 border-2 border-neutral-900" : "border-neutral-400"
        } bg-neutral-700 text-white transition-all hover:-translate-y-1 hover:shadow-md ${handle ? "cursor-grab select-none" : ""}`}
      >
        {handle && <GripVertical className="absolute right-0.5 top-0.5 h-3 w-3 text-neutral-300" aria-hidden />}
        <h3 className="max-h-24 overflow-hidden text-[11px] font-bold leading-tight" style={{ writingMode: "vertical-rl" }}>
          {book.title}
        </h3>
        <span className="text-[10px] font-bold text-neutral-200">{formatScore(book.score)}</span>
      </article>
    );
  }

  return (
    <article
      {...dragProps}
      className={`rounded-md p-2 transition-all hover:-translate-y-0.5 hover:border-neutral-500 hover:shadow-sm ${STATE_CLASS[state]} ${handle ? "cursor-grab select-none" : ""}`}
    >
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
        <span className="shrink-0 font-bold text-neutral-900">お宝度 {formatScore(book.score)}</span>
      </p>
      {(badge || book.status) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {book.status && <StatusBadge status={book.status} />}
          {badge}
        </div>
      )}
    </article>
  );
}
