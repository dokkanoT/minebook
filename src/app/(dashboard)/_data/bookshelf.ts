// src/app/(dashboard)/_data/bookshelf.ts
import type { PoolBook } from "../_components/bookshelf/BookPool";
import type { RuleItem } from "../_components/bookshelf/OperationRulesPanel";
import type { ShelfView } from "../_components/bookshelf/ShelfCard";
import type { StepItem } from "../_components/bookshelf/StepGuide";
import { MOCK_BOOKS } from "./books";
import { pickBook, pickBooks } from "./bookLookup";

function createShelf(id: string, name: string, bookIds: string[]): ShelfView {
  return { id, name, books: pickBooks(bookIds) };
}

const SHELF_HUMANITIES = createShelf("sh1", "人文・散歩", ["b06", "b08"]);
const SHELF_ART = createShelf("sh2", "芸術・記録", ["b02", "b09"]);
const SHELF_NATURE = createShelf("sh3", "自然・星", ["b04", "b12"]);
const SHELF_NEW = createShelf("sh4", "新規棚", []);

export const SHELVES: ShelfView[] = [SHELF_HUMANITIES, SHELF_ART, SHELF_NATURE, SHELF_NEW];

/** 棚に置かれている本のID */
const PLACED_IDS = new Set(SHELVES.flatMap((shelf) => shelf.books.map((b) => b.id)));

/** 収集プール（全12冊。棚に置かれていれば placed = true） */
export const POOL_BOOKS: PoolBook[] = MOCK_BOOKS.map((book) => ({
  id: book.id,
  title: book.title,
  author: book.author,
  category: book.category,
  score: book.score,
  placed: PLACED_IDS.has(book.id),
}));

/** ドラッグ例・代替導線で使う本（まだ棚にない1冊）と、置き先の棚 */
export const FLOW_EXAMPLE = {
  book: pickBook("b05"),
  shelf: SHELF_HUMANITIES,
};

export const BOOKSHELF_STEPS: StepItem[] = [
  { step: "ステップ1", title: "棚を作成", description: "空の本棚を作り、置く場所を用意します。" },
  { step: "ステップ2", title: "本をドラッグ", description: "収集プールの本を、棚へドラッグして配置します。" },
  { step: "ステップ3", title: "並びを調整", description: "棚の中で本を動かし、自分の分類に整えます。" },
];

export const OPERATION_RULES: RuleItem[] = [
  { title: "ドラッグ", description: "収集プールの本を、棚の上へドラッグして配置します。" },
  { title: "代替操作", description: "本を選んで「本棚に追加」を押しても配置できます。" },
  { title: "取り外し", description: "棚から外しても本は削除されず、「未配置」に戻ります。" },
];

export const BOOKSHELF_NOTES: string[] = [
  "本棚の配置は、コレクション・タグとは別の整理です。棚を並べ替えても、コレクションの内容は変わりません。",
  "読取済み・未保存の本は収集プールに含めません。書誌・店舗・価格・統計・スコアはサンプルです。",
];