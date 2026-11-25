"use client";

import { useEffect, useState, type DragEventHandler } from "react";
import { CheckCircle2, RotateCcw, X } from "lucide-react";
import { BookPool } from "../_components/bookshelf/BookPool";
import { MyShelvesPanel } from "../_components/bookshelf/MyShelvesPanel";
import type { PoolBook } from "../_components/bookshelf/BookPool";
import type { ShelfView } from "../_components/bookshelf/ShelfCard";
import type { TileBook } from "../_components/bookshelf/BookTile";
import { CATEGORIES } from "../_data/books";
import { POOL_BOOKS, SHELVES } from "../_data/bookshelf";

const SHELF_COLORS = [
  { value: "slate", label: "グレー", className: "bg-slate-500" },
  { value: "rose", label: "ピンク", className: "bg-rose-500" },
  { value: "amber", label: "イエロー", className: "bg-amber-500" },
  { value: "emerald", label: "グリーン", className: "bg-emerald-500" },
  { value: "sky", label: "ブルー", className: "bg-sky-500" },
  { value: "violet", label: "パープル", className: "bg-violet-500" },
] as const;

type Notice = { message: string; tone: "success" | "return" | "delete" };

export default function BookshelfPage() {
  const [poolBooks, setPoolBooks] = useState<PoolBook[]>(POOL_BOOKS);
  const [shelves, setShelves] = useState<ShelfView[]>(SHELVES);
  const [draggingBookId, setDraggingBookId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [selectedBook, setSelectedBook] = useState<TileBook | null>(null);
  const [shelfToDelete, setShelfToDelete] = useState<ShelfView | null>(null);
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);
  const [createShelfOpen, setCreateShelfOpen] = useState(false);
  const [newShelfName, setNewShelfName] = useState("");
  const [newShelfColor, setNewShelfColor] = useState<ShelfView["color"]>("slate");

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!selectedBook && !createShelfOpen && !shelfToDelete) return;

    const closeTopDialog = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (moveMenuOpen) {
        setMoveMenuOpen(false);
      } else if (shelfToDelete) {
        setShelfToDelete(null);
      } else if (createShelfOpen) {
        setCreateShelfOpen(false);
      } else if (selectedBook) {
        setSelectedBook(null);
      }
    };

    window.addEventListener("keydown", closeTopDialog);
    return () => window.removeEventListener("keydown", closeTopDialog);
  }, [createShelfOpen, moveMenuOpen, selectedBook, shelfToDelete]);

  useEffect(() => {
    const scrollNearEdge = (event: DragEvent) => {
      if (!draggingBookId) return;
      const edge = 76;
      const height = window.innerHeight;
      if (event.clientY < edge) {
        window.scrollBy({ top: -Math.ceil((edge - event.clientY) / 3), behavior: "auto" });
      } else if (event.clientY > height - edge) {
        window.scrollBy({ top: Math.ceil((event.clientY - (height - edge)) / 3), behavior: "auto" });
      }
    };

    document.addEventListener("dragover", scrollNearEdge);
    return () => document.removeEventListener("dragover", scrollNearEdge);
  }, [draggingBookId]);

  const handleDragStart: DragEventHandler<HTMLElement> = (event) => {
    const bookId = event.currentTarget.dataset.bookId;
    if (!bookId) return;
    event.dataTransfer.setData("text/plain", bookId);
    event.dataTransfer.effectAllowed = "move";
    const book = poolBooks.find((item) => item.id === bookId);
    if (book) {
      const preview = document.createElement("div");
      preview.setAttribute("aria-hidden", "true");
      Object.assign(preview.style, {
        position: "fixed",
        top: "-200px",
        left: "-200px",
        width: "52px",
        height: "148px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 6px",
        border: "2px solid #171717",
        borderRadius: "3px 3px 0 0",
        background: "#404040",
        color: "white",
        boxShadow: "0 12px 24px rgb(0 0 0 / 28%)",
        font: "700 11px/1.2 sans-serif",
        writingMode: "vertical-rl",
      });
      const title = document.createElement("span");
      title.textContent = book.title;
      const score = document.createElement("span");
      score.textContent = String(book.score);
      preview.append(title, score);
      document.body.append(preview);
      event.dataTransfer.setDragImage(preview, 18, 30);
      window.setTimeout(() => preview.remove(), 0);
    }
    setDraggingBookId(bookId);
  };

  const handleDragEnd: DragEventHandler<HTMLElement> = () => {
    setDraggingBookId(null);
  };

  const moveBookToShelf = (
    shelfId: string,
    bookId: string,
    isShelfMove = false,
    beforeBookId?: string,
  ) => {
    const book = poolBooks.find((item) => item.id === bookId);
    const destination = shelves.find((shelf) => shelf.id === shelfId);
    if (!book || !destination) return;

    const currentShelf = shelves.find((shelf) => shelf.books.some((item) => item.id === bookId));
    if (currentShelf?.id === shelfId) {
      if (beforeBookId === bookId) return;

      const reorderedBooks = [...destination.books];
      const currentIndex = reorderedBooks.findIndex((item) => item.id === bookId);
      const [movingBook] = reorderedBooks.splice(currentIndex, 1);
      const targetIndex = beforeBookId
        ? reorderedBooks.findIndex((item) => item.id === beforeBookId)
        : -1;
      reorderedBooks.splice(targetIndex < 0 ? reorderedBooks.length : targetIndex, 0, movingBook);

      if (reorderedBooks.every((item, index) => item.id === destination.books[index]?.id)) return;

      setShelves((currentShelves) =>
        currentShelves.map((shelf) =>
          shelf.id === shelfId ? { ...shelf, books: reorderedBooks } : shelf,
        ),
      );
      setDraggingBookId(null);
      setNotice({ message: `「${book.title}」を並べ替えました`, tone: "success" });
      return;
    }

    setShelves((currentShelves) =>
      currentShelves.map((shelf) => {
        const books = shelf.books.filter((item) => item.id !== bookId);
        if (shelf.id !== shelfId) return { ...shelf, books };
        const targetIndex = beforeBookId
          ? books.findIndex((item) => item.id === beforeBookId)
          : -1;
        if (targetIndex < 0) books.push(book);
        else books.splice(targetIndex, 0, book);
        return { ...shelf, books };
      }),
    );
    setPoolBooks((currentBooks) =>
      currentBooks.map((item) => (item.id === bookId ? { ...item, placed: true } : item)),
    );
    setDraggingBookId(null);
    setNotice({
      message: isShelfMove ? `「${book.title}」を別の棚へ移動しました` : `「${book.title}」を本棚に追加しました`,
      tone: "success",
    });
  };

  const moveBookToPool = (bookId: string) => {
    const book = poolBooks.find((item) => item.id === bookId);
    if (!book?.placed) return;

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
    setNotice({ message: `「${book.title}」を未配置に戻しました`, tone: "return" });
  };

  const deleteShelf = (shelfId: string) => {
    const shelf = shelves.find((item) => item.id === shelfId);
    if (!shelf) return;

    const returnedBookIds = new Set(shelf.books.map((book) => book.id));
    setShelves((currentShelves) => currentShelves.filter((item) => item.id !== shelfId));
    setPoolBooks((currentBooks) =>
      currentBooks.map((book) =>
        returnedBookIds.has(book.id) ? { ...book, placed: false } : book,
      ),
    );
    if (selectedBook && returnedBookIds.has(selectedBook.id)) setSelectedBook(null);
    setShelfToDelete(null);
    setNotice({ message: `「${shelf.name}」を削除しました`, tone: "delete" });
  };

  const createShelf = () => {
    const name = newShelfName.trim();
    if (!name) return;
    setShelves((currentShelves) => [
      ...currentShelves,
      { id: `shelf-${Date.now()}`, name, color: newShelfColor, books: [] },
    ]);
    setNotice({ message: `「${name}」を作成しました`, tone: "success" });
    setNewShelfName("");
    setNewShelfColor("slate");
    setCreateShelfOpen(false);
  };

  return (
    <>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">本棚</h1>
          <p className="mt-1 text-xs text-neutral-600">
            未配置の本をドラッグして棚に置きます。背表紙を押すと本の詳細が開きます。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-neutral-600">
          {CATEGORIES.slice(0, 4).map((category) => (
            <span key={category} className="inline-flex items-center gap-1">
              <span
                className={`h-2 w-2 rounded-[1px] ${
                  {
                    文学: "bg-sky-600",
                    芸術: "bg-violet-600",
                    人文: "bg-amber-600",
                    自然科学: "bg-emerald-600",
                  }[category] ?? "bg-neutral-500"
                }`}
                aria-hidden
              />
              {category}
            </span>
          ))}
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-[1px] bg-neutral-400" aria-hidden />
            上のお宝度 85以上
          </span>
        </div>
      </header>

      {notice && (
        <div
          role="status"
          className={`fixed right-5 top-5 z-[70] flex w-[min(24rem,calc(100vw-2.5rem))] items-center gap-3 rounded-xl border bg-white/95 px-4 py-3 text-sm font-medium shadow-xl shadow-neutral-900/10 backdrop-blur ${
            notice.tone === "return"
              ? "border-orange-200 text-orange-950"
              : notice.tone === "delete"
                ? "border-red-200 text-red-900"
                : "border-emerald-200 text-emerald-900"
          }`}
        >
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notice.tone === "return" ? "bg-orange-100" : notice.tone === "delete" ? "bg-red-100" : "bg-emerald-100"}`}>
            {notice.tone === "return" ? (
              <RotateCcw className="h-4 w-4 text-orange-700" aria-hidden />
            ) : notice.tone === "delete" ? (
              <X className="h-4 w-4 text-red-700" aria-hidden />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden />
            )}
          </span>
          <span className="flex-1">{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="通知を閉じる" className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)]">
        <BookPool
          books={poolBooks}
          shelves={shelves.map(({ id, name }) => ({ id, name }))}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDropBook={moveBookToPool}
          onQuickAdd={(bookId, shelfId) => moveBookToShelf(shelfId, bookId)}
          dropActive={draggingBookId !== null}
          draggingBookId={draggingBookId}
        />
        <MyShelvesPanel
          shelves={shelves}
          onDropBook={(shelfId, bookId, beforeBookId) =>
            moveBookToShelf(shelfId, bookId, false, beforeBookId)
          }
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          draggingBookId={draggingBookId}
          onCreateShelf={() => setCreateShelfOpen(true)}
          onBookClick={setSelectedBook}
          onDeleteShelf={(shelf) => setShelfToDelete(shelf)}
        />
      </div>

      {selectedBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/45 p-4"
          onClick={() => setSelectedBook(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-detail-title"
            className="w-full max-w-sm rounded-sm border border-neutral-200 bg-white p-5 shadow-xl"
            onClick={(event) => {
              event.stopPropagation();
              setMoveMenuOpen(false);
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-neutral-500">本の詳細</p>
                <h2 id="book-detail-title" className="mt-1 text-lg font-bold">{selectedBook.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                aria-label="閉じる"
                className="rounded-sm p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <dl className="mt-4 grid grid-cols-[5rem_1fr] gap-y-2 border-t border-neutral-200 pt-4 text-xs">
              <dt className="text-neutral-500">著者</dt><dd>{selectedBook.author}</dd>
              <dt className="text-neutral-500">カテゴリ</dt><dd>{selectedBook.category}</dd>
              <dt className="text-neutral-500">お宝度</dt><dd>{selectedBook.score}</dd>
            </dl>
            {shelves.some((shelf) => shelf.books.some((book) => book.id === selectedBook.id)) && (
              <div className="relative mt-5 border-t border-neutral-200 pt-4">
                <button
                  type="button"
                  aria-expanded={moveMenuOpen}
                  onClick={(event) => {
                    event.stopPropagation();
                    setMoveMenuOpen((open) => !open);
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-sm bg-neutral-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-neutral-700"
                >
                  棚移動
                </button>
                {moveMenuOpen && (
                  <div className="absolute left-0 top-full z-10 mt-2 min-w-44 rounded-lg border border-neutral-200 bg-white p-1.5 shadow-xl">
                    {shelves.filter((shelf) => shelf.id !== shelves.find((item) => item.books.some((book) => book.id === selectedBook.id))?.id).map((shelf) => (
                      <button
                        key={shelf.id}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          moveBookToShelf(shelf.id, selectedBook.id, true);
                          setSelectedBook(null);
                          setMoveMenuOpen(false);
                        }}
                        className="block w-full rounded-md px-3 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-100"
                      >
                        {shelf.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {createShelfOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-950/45 p-4" onClick={() => setCreateShelfOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="create-shelf-title" className="w-full max-w-sm rounded-sm border border-neutral-200 bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-neutral-500">マイ本棚</p>
                <h2 id="create-shelf-title" className="mt-1 text-lg font-bold">新しい棚を作成</h2>
              </div>
              <button type="button" onClick={() => setCreateShelfOpen(false)} aria-label="閉じる" className="rounded-sm p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <label className="mt-5 block text-xs font-medium text-neutral-700">
              棚の名前
              <input autoFocus value={newShelfName} onChange={(event) => setNewShelfName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") createShelf(); }} placeholder="例：読み返したい本" className="mt-1.5 h-10 w-full rounded-sm border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10" />
            </label>
            <fieldset className="mt-5">
              <legend className="text-xs font-medium text-neutral-700">棚の色</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {SHELF_COLORS.map((color) => (
                  <button key={color.value} type="button" onClick={() => setNewShelfColor(color.value)} aria-label={color.label} aria-pressed={newShelfColor === color.value} className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${newShelfColor === color.value ? "border-neutral-900 ring-2 ring-neutral-900 ring-offset-2" : "border-transparent hover:scale-105"}`}>
                    <span className={`h-6 w-6 rounded-full ${color.className}`} />
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setCreateShelfOpen(false)} className="h-9 rounded-sm border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50">キャンセル</button>
              <button type="button" onClick={createShelf} disabled={!newShelfName.trim()} className="h-9 rounded-sm bg-neutral-900 px-4 text-xs font-semibold text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40">棚を作成</button>
            </div>
          </section>
        </div>
      )}

      {shelfToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-950/45 p-4"
          onClick={() => setShelfToDelete(null)}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-shelf-title"
            aria-describedby="delete-shelf-description"
            className="w-full max-w-sm rounded-sm border border-neutral-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-[10px] font-semibold text-neutral-500">マイ本棚</p>
            <h2 id="delete-shelf-title" className="mt-1 text-lg font-bold">棚を削除しますか？</h2>
            <p id="delete-shelf-description" className="mt-3 text-sm leading-relaxed text-neutral-600">
              「{shelfToDelete.name}」を削除します。
              {shelfToDelete.books.length > 0
                ? ` 棚の中の${shelfToDelete.books.length}冊は収集プールの「未配置」に戻ります。`
                : ""}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShelfToDelete(null)}
                className="h-9 rounded-sm border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => deleteShelf(shelfToDelete.id)}
                className="h-9 rounded-sm bg-rose-700 px-4 text-xs font-semibold text-white hover:bg-rose-800"
              >
                棚を削除
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
