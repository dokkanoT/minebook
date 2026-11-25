// src/app/(dashboard)/_components/bookshelf/BookTile.tsx
import { GripVertical } from "lucide-react";
import type { DragEventHandler, ReactNode } from "react";

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
  variant?: "card" | "spine" | "row";
  badge?: ReactNode;
  /** つまめることを示すグリップを表示する */
  handle?: boolean;
  draggable?: boolean;
  onDragStart?: DragEventHandler<HTMLElement>;
  onDragEnd?: DragEventHandler<HTMLElement>;
  onSelect?: (book: TileBook) => void;
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
  onSelect,
}: BookTileProps) {
  const dragProps = {
    draggable,
    "data-book-id": book.id,
    onDragStart,
    onDragEnd,
  };

  if (variant === "spine") {
    return (
      <button
        {...dragProps}
        type="button"
        aria-label={`${book.title}、${book.author}、${book.category}、お宝度${book.score}`}
        aria-grabbed={state === "dragging"}
        onClick={() => onSelect?.(book)}
        className={`relative flex h-36 w-12 shrink-0 flex-col items-center justify-between rounded-t-sm border bg-neutral-700 px-1.5 py-2 text-white transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 ${
          state === "dragging"
            ? "pointer-events-none opacity-0"
            : "border-neutral-400 shadow-sm hover:-translate-y-1 hover:shadow-md"
        } ${handle ? `${state === "dragging" ? "cursor-grabbing" : "cursor-grab"} select-none` : ""}`}
      >
        {handle && <GripVertical className="absolute right-0.5 top-0.5 h-3 w-3 text-neutral-300" aria-hidden />}
        <h3 className="max-h-24 overflow-hidden text-[11px] font-bold leading-tight" style={{ writingMode: "vertical-rl" }}>
          {book.title}
        </h3>
        <span className="text-[10px] font-bold text-neutral-200">{book.score}</span>
      </button>
    );
  }

  if (variant === "row") {
    return (
      <article
        {...dragProps}
        aria-label={`${book.title}、${book.author}、${book.category}、お宝度${book.score}`}
        aria-grabbed={false}
        className={`flex min-w-0 items-center gap-3 rounded-sm border px-2.5 py-2 transition-colors ${
          state === "selected"
            ? STATE_CLASS.selected
            : "border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50"
        } ${state === "dragging" ? "opacity-0" : ""} ${handle ? "cursor-grab select-none" : ""}`}
      >
        {handle && <GripVertical className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />}
        <div className="h-11 w-7 shrink-0 border border-neutral-300 bg-neutral-200" aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-xs font-bold text-neutral-900">{book.title}</h3>
          <p className="mt-0.5 truncate text-[11px] text-neutral-600">{book.author} ・ {book.category}</p>
          <p className="mt-0.5 text-[10px] font-medium text-neutral-500">お宝度 {book.score}</p>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </article>
    );
  }

  return (
    <article
      {...dragProps}
      aria-grabbed={false}
      className={`rounded-md p-2 transition-all duration-200 ${STATE_CLASS[state]} ${handle ? "cursor-grab select-none" : ""}`}
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
        <span className="shrink-0 font-bold text-neutral-900">お宝度 {book.score}</span>
      </p>
      {badge && <div className="mt-2">{badge}</div>}
    </article>
  );
}
