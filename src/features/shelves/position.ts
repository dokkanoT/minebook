import "server-only";

import { generateKeyBetween } from "fractional-indexing";

import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

// itemId の本を shelfId の棚の beforeItemId の直前（省略時は末尾）に置くときの並び順キーを計算する。
// 動かす本自身は前後の候補から除く（同じ棚の中での並び替えに対応するため）
export async function computeShelfPosition(
  supabase: SupabaseClient,
  {
    itemId,
    shelfId,
    beforeItemId,
  }: { itemId: string; shelfId: string; beforeItemId?: string | null },
): Promise<{ ok: true; position: string } | { ok: false }> {
  let upper: string | null = null;

  if (beforeItemId) {
    const { data, error } = await supabase
      .from("collection_items")
      .select("shelf_position")
      .eq("id", beforeItemId)
      .eq("shelf_id", shelfId)
      .maybeSingle();
    if (error) throw error;
    // 差し込み先の本がその棚にない
    if (!data?.shelf_position) return { ok: false };
    upper = data.shelf_position;
  }

  let query = supabase
    .from("collection_items")
    .select("shelf_position")
    .eq("shelf_id", shelfId)
    .neq("id", itemId)
    .order("shelf_position", { ascending: false })
    .limit(1);
  if (upper) query = query.lt("shelf_position", upper);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  const lower = data?.shelf_position ?? null;

  return { ok: true, position: generateKeyBetween(lower, upper) };
}
