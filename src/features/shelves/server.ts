import "server-only";

import { requireUser } from "@/features/auth/dal";
import { createClient } from "@/lib/supabase/server";

export type ShelfWithCount = {
  id: string;
  name: string;
  createdAt: string;
  itemCount: number;
};

// 自分の本棚一覧（作成順）と各本棚の冊数
export async function getMyShelves(): Promise<ShelfWithCount[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shelves")
    .select("id, name, created_at, collection_items(count)")
    .eq("user_id", user.id)
    .order("created_at");
  if (error) throw error;

  return data.map((shelf) => ({
    id: shelf.id,
    name: shelf.name,
    createdAt: shelf.created_at,
    itemCount: shelf.collection_items[0]?.count ?? 0,
  }));
}

export type BookshelfItem = {
  itemId: string;
  isbn: string;
  title: string;
  author: string | null;
  // categories.slug（未分類は null）
  category: string | null;
  treasureScore: number | null;
  shelfId: string | null;
  // 配置済みの棚の名前（未配置は null）
  shelfName: string | null;
  scannedAt: string;
};

export type BookshelfShelf = {
  id: string;
  name: string;
  // 手動の並び順（shelf_position 順）
  items: BookshelfItem[];
  // お宝度が付いている本の平均。1 冊もなければ null
  averageTreasureScore: number | null;
};

export type Bookshelf = {
  shelves: BookshelfShelf[];
  // 収集プール「すべて」（スキャンが新しい順）。「未配置」は shelfId === null で絞り込む
  pool: BookshelfItem[];
};

// 本棚画面用：棚（作成順）と棚ごとの本、収集プール
export async function getMyBookshelf(): Promise<Bookshelf> {
  const user = await requireUser();
  const supabase = await createClient();

  const [shelvesResult, itemsResult] = await Promise.all([
    supabase
      .from("shelves")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at"),
    supabase
      .from("collection_items")
      .select(
        "id, isbn, shelf_id, shelf_position, treasure_score, scanned_at, book:books!inner(title, author, category)",
      )
      .eq("user_id", user.id)
      .order("scanned_at", { ascending: false }),
  ]);
  if (shelvesResult.error) throw shelvesResult.error;
  if (itemsResult.error) throw itemsResult.error;

  const shelfNames = new Map(shelvesResult.data.map((s) => [s.id, s.name]));
  const pool = itemsResult.data.map((row) => ({
    position: row.shelf_position,
    item: {
      itemId: row.id,
      isbn: row.isbn,
      title: row.book.title,
      author: row.book.author,
      category: row.book.category,
      treasureScore: row.treasure_score,
      shelfId: row.shelf_id,
      shelfName: row.shelf_id ? (shelfNames.get(row.shelf_id) ?? null) : null,
      scannedAt: row.scanned_at,
    } satisfies BookshelfItem,
  }));

  const shelves = shelvesResult.data.map((shelf) => {
    const items = pool
      .filter((p) => p.item.shelfId === shelf.id)
      // DB の collate "C" と同じバイト順で比較する（localeCompare は使わない）
      .sort((a, b) => ((a.position ?? "") < (b.position ?? "") ? -1 : 1))
      .map((p) => p.item);
    const scores = items
      .map((i) => i.treasureScore)
      .filter((s): s is number => s !== null);
    return {
      id: shelf.id,
      name: shelf.name,
      items,
      averageTreasureScore:
        scores.length > 0
          ? scores.reduce((sum, s) => sum + s, 0) / scores.length
          : null,
    };
  });

  return { shelves, pool: pool.map((p) => p.item) };
}
