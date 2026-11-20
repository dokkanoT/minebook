// src/app/(dashboard)/bookshelf/page.tsx
"use client";

import { useEffect, useState, type DragEventHandler } from "react";
import { CheckCircle2, Inbox, LibraryBig, MoveRight } from "lucide-react";
import { BookPool } from "../_components/bookshelf/BookPool";
import { BookshelfNotes } from "../_components/bookshelf/BookshelfNotes";
import { MyShelvesPanel } from "../_components/bookshelf/MyShelvesPanel";
import { StepGuide } from "../_components/bookshelf/StepGuide";
import { PageHeader } from "../_components/layout/PageHeader";
import { CATEGORIES } from "../_data/books";
import type { PoolBook } from "../_components/bookshelf/BookPool";
import type { ShelfView } from "../_components/bookshelf/ShelfCard";
import {
  BOOKSHELF_NOTES,
  BOOKSHELF_STEPS,
  POOL_BOOKS,
  SHELVES,
} from "../_data/bookshelf";

export default function BookshelfPage() {
  const [poolBooks, setPoolBooks] = useState<PoolBook[]>(POOL_BOOKS);
  const [shelves, setShelves] = useState<ShelfView[]>(SHELVES);
  const [draggingBookId, setDraggingBookId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const unplacedCount = poolBooks.filter((book) => !book.placed).length;
  const placedCount = poolBooks.length - unplacedCount;

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleDragStart: DragEventHandler<HTMLElement> = (event) => {
    const bookId = event.currentTarget.dataset.bookId;
    if (!bookId) return;
    event.dataTransfer.setData("text/plain", bookId);
    event.dataTransfer.effectAllowed = "move";
    setDraggingBookId(bookId);
  };

  const handleDragEnd: DragEventHandler<HTMLElement> = () => {
    setDraggingBookId(null);
  };

  const moveBookToShelf = (shelfId: string, bookId: string) => {
    const book = poolBooks.find((item) => item.id === bookId);
    if (!book) return;

    setShelves((currentShelves) =>
      currentShelves.map((shelf) => {
        const books = shelf.books.filter((item) => item.id !== bookId);
        return shelf.id === shelfId ? { ...shelf, books: [...books, book] } : { ...shelf, books };
      }),
    );
    setPoolBooks((currentBooks) =>
      currentBooks.map((item) => (item.id === bookId ? { ...item, placed: true } : item)),
    );
    setDraggingBookId(null);
    setNotice(`「${book.title}」を本棚に追加しました`);
  };

  const moveBookToPool = (bookId: string) => {
    const book = poolBooks.find((item) => item.id === bookId);
    setShelves((currentShelves) =>
      currentShelves.map((shelf) => ({
        ...shelf,
        books: shelf.books.filter((item) => item.id !== bookId),
      })),
    );
    setPoolBooks((currentBooks) =>
      currentBooks.map((item) => (item.id === bookId ? { ...item, placed: false } : item)),
    );
    setDraggingBookId(null);
    if (book) setNotice(`「${book.title}」を未配置に戻しました`);
  };

  return (
    <>
      <PageHeader
        title="本棚"
        description="未配置の本を選び、好きな棚へドラッグして整理できます。"
        meta={`${poolBooks.length}冊を管理中`}
      />

      {notice && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          <span>{notice}</span>
        </div>
      )}

      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
            <Inbox className="h-4 w-4" aria-hidden /> 未配置
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight">{unplacedCount}<span className="ml-1 text-sm font-medium text-neutral-500">冊</span></p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
            <LibraryBig className="h-4 w-4" aria-hidden /> 本棚に配置済み
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight">{placedCount}<span className="ml-1 text-sm font-medium text-neutral-500">冊</span></p>
        </div>
        <div className="rounded-lg border border-neutral-900 bg-neutral-900 p-4 text-white shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
            <MoveRight className="h-4 w-4" aria-hidden /> 次にすること
          </div>
          <p className="mt-2 text-sm font-bold">未配置の本を棚へドラッグ</p>
        </div>
      </div>

      <StepGuide steps={BOOKSHELF_STEPS} />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
        <BookPool
          books={poolBooks}
          categories={CATEGORIES}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDropBook={moveBookToPool}
          dropActive={draggingBookId !== null}
        />
        <div className="lg:sticky lg:top-20">
          <MyShelvesPanel
            shelves={shelves}
            onDropBook={moveBookToShelf}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        </div>
      </div>

      <div className="mt-6">
        <BookshelfNotes notes={BOOKSHELF_NOTES} />
      </div>
    </>
  );
}
