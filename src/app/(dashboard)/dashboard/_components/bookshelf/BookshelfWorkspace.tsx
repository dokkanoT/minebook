"use client";

import {
  useEffect,
  useOptimistic,
  useState,
  useTransition,
  type DragEventHandler,
} from "react";
import { unstable_rethrow } from "next/navigation";
import { AlertCircle, CheckCircle2, Inbox, LibraryBig, MoveRight } from "lucide-react";
import {
  createShelf,
  deleteShelf,
  placeOnShelf,
  removeFromShelf,
} from "@/features/shelves/actions";
import type { ActionResult } from "@/lib/utils/action-result";
import { BookPool } from "./BookPool";
import { BookshelfNotes } from "./BookshelfNotes";
import { MyShelvesPanel } from "./MyShelvesPanel";
import { StepGuide } from "./StepGuide";
import { PageHeader } from "../layout/PageHeader";
import type { BookshelfView } from "../../_data/fromBookshelf";
import { BOOKSHELF_NOTES, BOOKSHELF_STEPS } from "../../_data/bookshelf";

type Notice = { kind: "success" | "error"; text: string };

// 保存が終わる前に画面だけ先に動かすための操作
type OptimisticMove =
  | { type: "place"; bookId: string; shelfId: string }
  | { type: "unplace"; bookId: string };

function applyMove(view: BookshelfView, move: OptimisticMove): BookshelfView {
  const book = view.pool.find((b) => b.id === move.bookId);
  if (!book) return view;

  const shelves = view.shelves.map((shelf) => {
    const books = shelf.books.filter((b) => b.id !== move.bookId);
    return move.type === "place" && shelf.id === move.shelfId
      ? { ...shelf, books: [...books, book] }
      : { ...shelf, books };
  });
  const pool = view.pool.map((b) =>
    b.id === move.bookId ? { ...b, placed: move.type === "place" } : b,
  );
  return { shelves, pool };
}

type BookshelfWorkspaceProps = {
  /** サーバーで取得した本棚。保存のたびに refresh() で新しい値が届く */
  bookshelf: BookshelfView;
  categories: string[];
};

/**
 * 本棚画面の操作（ドラッグでの配置・棚の作成と削除）を管理するクライアント部品
 */
export function BookshelfWorkspace({ bookshelf, categories }: BookshelfWorkspaceProps) {
  const [view, applyOptimistic] = useOptimistic(bookshelf, applyMove);
  const [isPending, startTransition] = useTransition();
  const [draggingBookId, setDraggingBookId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const unplacedCount = view.pool.filter((book) => !book.placed).length;
  const placedCount = view.pool.length - unplacedCount;

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  // Server Action を呼び、結果を通知に出す。失敗したら画面は保存前の状態に戻る
  const save = (
    action: () => Promise<ActionResult<unknown>>,
    successText: string,
    move?: OptimisticMove,
  ) => {
    startTransition(async () => {
      if (move) applyOptimistic(move);
      try {
        const result = await action();
        setNotice(
          result.ok
            ? { kind: "success", text: successText }
            : { kind: "error", text: result.error },
        );
      } catch (err) {
        // ログイン切れのリダイレクトなど、Next.js の処理は止めない
        unstable_rethrow(err);
        setNotice({ kind: "error", text: "保存中にエラーが発生しました。もう一度お試しください" });
      }
    });
  };

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
    setDraggingBookId(null);
    const book = view.pool.find((item) => item.id === bookId);
    if (!book) return;
    // 棚の末尾に置く（棚の中での並び替えは、置く位置を選べる UI ができてから）
    save(
      () => placeOnShelf({ itemId: bookId, shelfId }),
      `「${book.title}」を本棚に追加しました`,
      { type: "place", bookId, shelfId },
    );
  };

  const moveBookToPool = (bookId: string) => {
    setDraggingBookId(null);
    const book = view.pool.find((item) => item.id === bookId);
    if (!book?.placed) return;
    save(
      () => removeFromShelf({ itemId: bookId }),
      `「${book.title}」を未配置に戻しました`,
      { type: "unplace", bookId },
    );
  };

  // TODO(PC 担当): 名前の入力は仮で prompt を使っている。画面に合った入力欄に置き換える
  const handleCreateShelf = () => {
    const name = window.prompt("本棚の名前（30 文字まで）")?.trim();
    if (!name) return;
    save(() => createShelf({ name }), `本棚「${name}」を作成しました`);
  };

  const handleDeleteShelf = (shelfId: string) => {
    const shelf = view.shelves.find((s) => s.id === shelfId);
    if (!shelf || !window.confirm(`本棚「${shelf.name}」を削除しますか？`)) return;
    save(() => deleteShelf({ id: shelfId }), `本棚「${shelf.name}」を削除しました`);
  };

  return (
    <>
      <PageHeader
        title="本棚"
        description="未配置の本を選び、好きな棚へドラッグして整理できます。"
        meta={`${view.pool.length}冊を管理中`}
      />

      {notice && (
        <div
          role={notice.kind === "error" ? "alert" : "status"}
          className={`mb-5 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium shadow-sm ${
            notice.kind === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.kind === "error" ? (
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          )}
          <span>{notice.text}</span>
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
          <p className="mt-2 text-sm font-bold">
            {view.shelves.length === 0 ? "「棚を作成」で本棚を作る" : "未配置の本を棚へドラッグ"}
          </p>
        </div>
      </div>

      <StepGuide steps={BOOKSHELF_STEPS} />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
        <BookPool
          books={view.pool}
          categories={categories}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDropBook={moveBookToPool}
          dropActive={draggingBookId !== null}
        />
        <div className="lg:sticky lg:top-20">
          <MyShelvesPanel
            shelves={view.shelves}
            onDropBook={moveBookToShelf}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onCreateShelf={handleCreateShelf}
            onDeleteShelf={handleDeleteShelf}
            busy={isPending}
          />
        </div>
      </div>

      <div className="mt-6">
        <BookshelfNotes notes={BOOKSHELF_NOTES} />
      </div>
    </>
  );
}
