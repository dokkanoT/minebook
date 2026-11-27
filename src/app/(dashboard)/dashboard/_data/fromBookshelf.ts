import type { Category } from "@/features/books/server";
import type { Bookshelf, BookshelfItem } from "@/features/shelves/server";

import type { PoolBook } from "../_components/bookshelf/BookPool";
import { BOOK_STATUS, type BookStatus, type TileBook } from "../_components/bookshelf/BookTile";
import type { ShelfView } from "../_components/bookshelf/ShelfCard";

export const UNCATEGORIZED = "未分類";

const isBookStatus = (status: string | null): status is BookStatus =>
  status !== null && Object.hasOwn(BOOK_STATUS, status);

export type BookshelfView = {
  shelves: ShelfView[];
  pool: PoolBook[];
};

// DB の本棚データを、本棚画面の部品が使う形に変える
export function toBookshelfView(
  bookshelf: Bookshelf,
  categories: Category[],
): BookshelfView {
  const categoryNames = new Map(categories.map((c) => [c.slug, c.name]));

  const toTile = (item: BookshelfItem): TileBook => ({
    id: item.itemId,
    title: item.title,
    author: item.author ?? "著者不明",
    category: (item.category && categoryNames.get(item.category)) ?? UNCATEGORIZED,
    // お宝度の計算は別ブランチで作るので、今は null（画面では「—」）
    score: item.treasureScore,
    status: isBookStatus(item.status) ? item.status : null,
  });

  return {
    shelves: bookshelf.shelves.map((shelf) => ({
      id: shelf.id,
      name: shelf.name,
      books: shelf.items.map(toTile),
    })),
    pool: bookshelf.pool.map((item) => ({
      ...toTile(item),
      placed: item.shelfId !== null,
    })),
  };
}

// 絞り込みの選択肢：カテゴリーの表示順に、未分類を最後に足す
export function categoryOptions(categories: Category[]): string[] {
  return [...categories.map((c) => c.name), UNCATEGORIZED];
}
