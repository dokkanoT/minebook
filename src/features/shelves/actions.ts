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
