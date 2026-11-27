// src/app/(dashboard)/_components/bookshelf/ShelfCard.tsx
import type { DragEventHandler, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { BookTile, type TileBook } from "./BookTile";

export type ShelfBookLocation = { row: number; compartment: number };

export function buildDefaultBookLocations(
  books: TileBook[],
  rowCount: number,
  dividerPositionsByRow: number[][],
): Record<string, ShelfBookLocation> {
  const cells: ShelfBookLocation[] = [];
  for (let row = 0; row < rowCount; row += 1) {
    const compartmentCount = (dividerPositionsByRow[row]?.length ?? 0) + 1;
    for (let compartment = 0; compartment < compartmentCount; compartment += 1) {
      cells.push({ row, compartment });
    }
  }
  if (cells.length === 0 || books.length === 0) return {};

  return Object.fromEntries(
    books.map((book, index) => [
      book.id,
      cells[Math.min(cells.length - 1, Math.floor((index * cells.length) / books.length))],
    ]),
  );
}

export function getRequiredShelfCellWidth(
  section: HTMLElement,
  additionalBookWidth = 0,
  excludedBookId?: string,
  reserveRightDivider = false,
) {
  const style = window.getComputedStyle(section);
  const books = Array.from(section.querySelectorAll<HTMLElement>("[data-book-id]"))
    .filter((book) => book.dataset.bookId !== excludedBookId);
  const bookCount = books.length + (additionalBookWidth > 0 ? 1 : 0);
  const gap = Number.parseFloat(style.columnGap) || 0;
  const borderRight = Number.parseFloat(style.borderRightWidth) || 0;
  const dividerWidth = reserveRightDivider ? Math.max(borderRight, 7) : borderRight;

  return books.reduce((total, book) => total + book.getBoundingClientRect().width, additionalBookWidth) +
    Math.max(0, bookCount - 1) * gap +
    (Number.parseFloat(style.paddingLeft) || 0) +
    (Number.parseFloat(style.paddingRight) || 0) +
    dividerWidth;
}

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
  rowCount?: number;
  dividerPositionsByRow?: number[][];
  bookLocations?: Record<string, ShelfBookLocation>;
  activeDropTarget?: ShelfBookLocation | null;
  onMoveDivider?: (row: number, index: number, position: number) => void;
  onRemoveDivider?: (row: number, index: number) => void;
  onAddDivider?: (row: number) => void;
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
  rowCount = 1,
  dividerPositionsByRow = [],
  bookLocations,
  activeDropTarget = null,
  onMoveDivider,
  onRemoveDivider,
  onAddDivider,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  draggingBookId = null,
  onBookClick,
}: ShelfCardProps) {
  const resolvedBookLocations = bookLocations ?? buildDefaultBookLocations(
    shelf.books,
    rowCount,
    dividerPositionsByRow,
  );

  const requestDividerPosition = (
    event: ReactPointerEvent<HTMLButtonElement> | ReactKeyboardEvent<HTMLButtonElement>,
    rowIndex: number,
    dividerIndex: number,
    requestedPosition: number,
  ) => {
    const row = event.currentTarget.closest<HTMLElement>("[data-shelf-row]");
    const rowWidth = row?.clientWidth ?? 0;
    const sections = Array.from(row?.querySelectorAll<HTMLElement>("[data-row-section]") ?? []);
    const positions = dividerPositionsByRow[rowIndex] ?? [];
    const previousBoundary = dividerIndex === 0 ? 0 : positions[dividerIndex - 1];
    const nextBoundary = dividerIndex === positions.length - 1 ? 100 : positions[dividerIndex + 1];
    const leftWidth = sections[dividerIndex] ? getRequiredShelfCellWidth(sections[dividerIndex]) : 0;
    const rightWidth = sections[dividerIndex + 1] ? getRequiredShelfCellWidth(sections[dividerIndex + 1]) : 0;
    const min = Math.max(
      previousBoundary + 4,
      previousBoundary + (rowWidth ? (leftWidth / rowWidth) * 100 : 4),
    );
    const max = Math.min(
      nextBoundary - 4,
      nextBoundary - (rowWidth ? (rightWidth / rowWidth) * 100 : 4),
    );

    // 本が隣の区画に収まらない幅まで動かさず、背表紙が仕切りに隠れないようにする。
    if (min <= max) onMoveDivider?.(rowIndex, dividerIndex, Math.min(max, Math.max(min, requestedPosition)));
  };

  return (
    <section
      data-shelf-id={shelf.id}
      className={`min-w-0 rounded-sm p-4 ${
        highlight
          ? "border-2 border-dashed border-neutral-900 bg-neutral-50 shadow-md"
          : "border border-neutral-200 bg-white shadow-sm"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1 basis-36">
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

      <div
        data-shelf-frame
        className="relative rounded-md border-[9px] border-[#9a6034] bg-[#34271e] p-2 shadow-[inset_0_0_0_2px_rgba(255,220,170,0.2),0_5px_12px_rgba(48,30,14,0.2)] sm:border-[12px] sm:p-3"
        style={{
          borderImage: "linear-gradient(135deg,#d5a36a 0%,#a76b3a 18%,#774323 43%,#c58b51 68%,#87502b 100%) 1",
          backgroundImage: "linear-gradient(90deg,rgba(255,255,255,.035),transparent 22%,rgba(0,0,0,.12) 100%), repeating-linear-gradient(0deg,#38291e 0 3px,#3e2e21 3px 6px)",
        }}
      >
        <div className="space-y-2">
          {Array.from({ length: rowCount }, (_, rowIndex) => {
            const dividerPositions = dividerPositionsByRow[rowIndex] ?? [];
            const boundaries = [0, ...dividerPositions, 100];
            const compartmentWidths = boundaries.slice(0, -1).map((start, index) => boundaries[index + 1] - start);

            return (
              <div key={rowIndex}>
                <div className="mb-1 flex items-center justify-between px-1 text-[10px] text-amber-100/75">
                  <span>{rowIndex + 1}段目</span>
                  <button
                    type="button"
                    disabled={dividerPositions.length >= 4}
                    onClick={() => onAddDivider?.(rowIndex)}
                    className="rounded px-1.5 py-0.5 font-medium text-amber-50 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`${shelf.name} ${rowIndex + 1}段目に仕切りを追加`}
                  >
                    ＋仕切り
                  </button>
                </div>
                <div
                  data-shelf-row
                  data-row-index={rowIndex}
                  className="relative grid h-40 min-w-0 border-b-[8px] border-[#a66b3b] bg-[#30251d] pb-2 pt-1 shadow-[0_4px_0_#704323] sm:h-44"
                  style={{ gridTemplateColumns: compartmentWidths.map((width) => `${width}%`).join(" ") }}
                >
                  {compartmentWidths.map((_, compartmentIndex) => {
                    const rowBooks = shelf.books.filter((book) => {
                      const location = resolvedBookLocations[book.id];
                      return location?.row === rowIndex && location.compartment === compartmentIndex;
                    });
                    const isActiveDrop = activeDropTarget?.row === rowIndex && activeDropTarget.compartment === compartmentIndex;
                    return (
                      <div
                        key={compartmentIndex}
                        data-row-section
                        data-row-index={rowIndex}
                        data-section-index={compartmentIndex}
                        className={`relative z-10 box-border flex h-full min-w-0 items-end gap-1 overflow-x-auto px-1 transition-colors sm:gap-1.5 sm:px-2 ${
                          compartmentIndex < compartmentWidths.length - 1
                            ? "border-r-[7px] border-[#a66b3b]"
                            : ""
                        } ${isActiveDrop ? "bg-amber-100/20 ring-2 ring-inset ring-amber-200" : ""}`}
                      >
                        {rowBooks.map((book) => (
                          <div key={book.id} className="relative z-10 flex h-full shrink-0 items-end">
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
                        {shelf.books.length === 0 && rowIndex === 0 && compartmentIndex === 0 && (
                          <p className="flex h-full w-full items-center justify-center text-xs text-amber-100/65">本をドラッグして棚に置く</p>
                        )}
                      </div>
                    );
                  })}
                  {dividerPositions.map((position, index) => (
                    <div
                      key={`${shelf.id}-divider-${rowIndex}-${index}`}
                      className="absolute inset-y-0 z-20 -translate-x-1/2 touch-none"
                      style={{ left: `${position}%` }}
                    >
                      <button
                        type="button"
                        role="slider"
                        aria-orientation="horizontal"
                        aria-label={`${shelf.name} ${rowIndex + 1}段目の仕切り${index + 1}の位置`}
                        aria-valuemin={4}
                        aria-valuemax={96}
                        aria-valuenow={Math.round(position)}
                        title="ドラッグして仕切りを移動（← →キーでも調整できます）"
                        onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
                        onPointerMove={(event) => {
                          if (event.buttons !== 1) return;
                          const row = event.currentTarget.closest<HTMLElement>("[data-shelf-row]");
                          const bounds = row?.getBoundingClientRect();
                          if (!bounds || bounds.width === 0) return;
                          requestDividerPosition(event, rowIndex, index, ((event.clientX - bounds.left) / bounds.width) * 100);
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                          event.preventDefault();
                          requestDividerPosition(event, rowIndex, index, position + (event.key === "ArrowRight" ? 2 : -2));
                        }}
                        className="h-full w-4 cursor-col-resize border-x border-transparent bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      />
                      <button
                        type="button"
                        aria-label={`${shelf.name} ${rowIndex + 1}段目の仕切り${index + 1}を削除`}
                        onClick={() => onRemoveDivider?.(rowIndex, index)}
                        className="absolute -top-1 left-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-[#5a3825] text-[11px] text-white shadow hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {children}
      {footer}
    </section>
  );
}
