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
