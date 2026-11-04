"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/features/auth/dal";
import { createClient } from "@/lib/supabase/server";
import {
  dbFailure,
  failure,
  invalidInput,
  success,
  type ActionResult,
} from "@/lib/utils/action-result";
import { idSchema, nameSchema } from "@/lib/utils/schemas";

import { computeShelfPosition } from "./position";

const SHELF_NAME_MAX = 30;
const DUPLICATE_NAME = "同じ名前の本棚がすでにあります";

const createSchema = z.object({ name: nameSchema(SHELF_NAME_MAX) });

export async function createShelf(
  input: z.input<typeof createSchema>,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shelves")
    .insert({ user_id: user.id, name: parsed.data.name })
    .select("id")
    .single();
  if (error) return dbFailure(error, { unique: DUPLICATE_NAME });

  refresh();
  return success({ id: data.id });
}

const renameSchema = z.object({
  id: idSchema,
  name: nameSchema(SHELF_NAME_MAX),
});

export async function renameShelf(
  input: z.input<typeof renameSchema>,
): Promise<ActionResult> {
  await requireUser();
  const parsed = renameSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);

  const supabase = await createClient();
  // 他人の本棚は RLS で対象外になり、0 件更新になる
  const { data, error } = await supabase
    .from("shelves")
    .update({ name: parsed.data.name })
    .eq("id", parsed.data.id)
    .select("id");
  if (error) return dbFailure(error, { unique: DUPLICATE_NAME });
  if (data.length === 0) return failure("本棚が見つかりません");

  refresh();
  return success(null);
}

const deleteSchema = z.object({ id: idSchema });

// 本棚を削除しても中の本はコレクションに残る（未分類になる）
export async function deleteShelf(
  input: z.input<typeof deleteSchema>,
): Promise<ActionResult> {
  await requireUser();
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shelves")
    .delete()
    .eq("id", parsed.data.id)
    .select("id");
  if (error) return dbFailure(error);
  if (data.length === 0) return failure("本棚が見つかりません");

  refresh();
  return success(null);
}

const placeSchema = z.object({
  itemId: idSchema,
  shelfId: idSchema,
  // この本の直前に置く。省略・null なら棚の末尾
  beforeItemId: idSchema.nullish(),
});

// 本を棚に置く。プールからの配置・棚の中での並び替え・別の棚への移動のすべてに使う
export async function placeOnShelf(
  input: z.input<typeof placeSchema>,
): Promise<ActionResult> {
  await requireUser();
  const parsed = placeSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);
  const { itemId, shelfId, beforeItemId } = parsed.data;
  if (beforeItemId === itemId) return success(null);

  const supabase = await createClient();
  const { data: shelf, error: shelfError } = await supabase
    .from("shelves")
    .select("id")
    .eq("id", shelfId)
    .maybeSingle();
  if (shelfError) return dbFailure(shelfError);
  if (!shelf) return failure("本棚が見つかりません");

  // 同時に同じ位置へ置かれて並び順が重複した場合は、計算し直してもう一度だけ試す
  for (let attempt = 0; attempt < 2; attempt++) {
    let position;
    try {
      position = await computeShelfPosition(supabase, {
        itemId,
        shelfId,
        beforeItemId,
      });
    } catch (e) {
      return dbFailure(e as { message: string });
    }
    if (!position.ok) return failure("置く位置の本が見つかりません");

    const { data, error } = await supabase
      .from("collection_items")
      .update({ shelf_id: shelfId, shelf_position: position.position })
      .eq("id", itemId)
      .select("id");
    if (error?.code === "23505") continue;
    if (error) return dbFailure(error);
    if (data.length === 0) return failure("本が見つかりません");

    refresh();
    return success(null);
  }
  return failure("ほかの操作と重なりました。もう一度お試しください");
}

const removeFromShelfSchema = z.object({ itemId: idSchema });

// 棚から外して未配置に戻す（本の登録やタグは消えない）
export async function removeFromShelf(
  input: z.input<typeof removeFromShelfSchema>,
): Promise<ActionResult> {
  await requireUser();
  const parsed = removeFromShelfSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);

  const supabase = await createClient();
  // shelf_position は DB のトリガーで null になる
  const { data, error } = await supabase
    .from("collection_items")
    .update({ shelf_id: null })
    .eq("id", parsed.data.itemId)
    .select("id");
  if (error) return dbFailure(error);
  if (data.length === 0) return failure("本が見つかりません");

  refresh();
  return success(null);
}
