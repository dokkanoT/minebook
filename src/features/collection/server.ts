import "server-only";

import { requireUser } from "@/features/auth/dal";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type CollectionItem = Tables<"collection_items"> & {
  book: Tables<"books">;
  tags: Tables<"tags">[];
};

export type CollectionFilter = {
  // undefined: すべて / null: 本棚に入っていない本 / string: その本棚
  shelfId?: string | null;
  // categories.slug
  category?: string;
  tagId?: string;
};

const ITEM_SELECT =
  "*, book:books!inner(*), item_tags:collection_item_tags(tag:tags(*))";

// 自分のコレクション（スキャンが新しい順）
export async function getMyCollection(
  filter: CollectionFilter = {},
): Promise<CollectionItem[]> {
  const user = await requireUser();
  const supabase = await createClient();

  let query = supabase
    .from("collection_items")
    .select(ITEM_SELECT)
    .eq("user_id", user.id)
    .order("scanned_at", { ascending: false });

  if (filter.shelfId === null) query = query.is("shelf_id", null);
  else if (filter.shelfId) query = query.eq("shelf_id", filter.shelfId);
  if (filter.category) query = query.eq("book.category", filter.category);

  if (filter.tagId) {
    const { data: tagged, error } = await supabase
      .from("collection_item_tags")
      .select("collection_item_id")
      .eq("tag_id", filter.tagId);
    if (error) throw error;
    query = query.in(
      "id",
      tagged.map((t) => t.collection_item_id),
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data.map(toCollectionItem);
}

// 1 件取得。自分のものでなければ null
export async function getCollectionItem(
  id: string,
): Promise<CollectionItem | null> {
  await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("collection_items")
    .select(ITEM_SELECT)
    .eq("id", id)
    .maybeSingle();
  // uuid として不正な id は「見つからない」扱い
  if (error?.code === "22P02") return null;
  if (error) throw error;
  return data && toCollectionItem(data);
}

function toCollectionItem({
  item_tags,
  ...item
}: Tables<"collection_items"> & {
  book: Tables<"books">;
  item_tags: { tag: Tables<"tags"> }[];
}): CollectionItem {
  return { ...item, tags: item_tags.map((t) => t.tag) };
}
