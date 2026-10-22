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

const TAG_NAME_MAX = 20;
const DUPLICATE_NAME = "同じ名前のタグがすでにあります";

// "#RRGGBB" 形式。未指定なら null（フロントの既定色で表示）
const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "色は #RRGGBB の形式で指定してください")
  .nullish();

const createSchema = z.object({
  name: nameSchema(TAG_NAME_MAX),
  color: colorSchema,
});

export async function createTag(
  input: z.input<typeof createSchema>,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .insert({ user_id: user.id, ...parsed.data })
    .select("id")
    .single();
  if (error) return dbFailure(error, { unique: DUPLICATE_NAME });

  refresh();
  return success({ id: data.id });
}

const editSchema = z.object({
  id: idSchema,
  name: nameSchema(TAG_NAME_MAX).optional(),
  color: colorSchema,
});

// next/cache の updateTag と紛らわしいので editTag という名前にしている
export async function editTag(
  input: z.input<typeof editSchema>,
): Promise<ActionResult> {
  await requireUser();
  const parsed = editSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);
  const { id, ...changes } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .update(changes)
    .eq("id", id)
    .select("id");
  if (error) return dbFailure(error, { unique: DUPLICATE_NAME });
  if (data.length === 0) return failure("タグが見つかりません");

  refresh();
  return success(null);
}

const deleteSchema = z.object({ id: idSchema });

// タグを削除すると、付いていた本からも外れる
export async function deleteTag(
  input: z.input<typeof deleteSchema>,
): Promise<ActionResult> {
  await requireUser();
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .delete()
    .eq("id", parsed.data.id)
    .select("id");
  if (error) return dbFailure(error);
  if (data.length === 0) return failure("タグが見つかりません");

  refresh();
  return success(null);
}

const setItemTagsSchema = z.object({
  itemId: idSchema,
  tagIds: z.array(idSchema).max(20, "タグは20個までです"),
});

// 本に付けるタグを、渡した一覧と同じ状態にする（足りないものは追加、余分は外す）
export async function setItemTags(
  input: z.input<typeof setItemTagsSchema>,
): Promise<ActionResult> {
  await requireUser();
  const parsed = setItemTagsSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);
  const { itemId } = parsed.data;
  const tagIds = [...new Set(parsed.data.tagIds)];

  const supabase = await createClient();
  const { data: current, error: selectError } = await supabase
    .from("collection_item_tags")
    .select("tag_id")
    .eq("collection_item_id", itemId);
  if (selectError) return dbFailure(selectError);

  const currentIds = new Set(current.map((t) => t.tag_id));
  const toAdd = tagIds.filter((id) => !currentIds.has(id));
  const toRemove = [...currentIds].filter((id) => !tagIds.includes(id));

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("collection_item_tags")
      .delete()
      .eq("collection_item_id", itemId)
      .in("tag_id", toRemove);
    if (error) return dbFailure(error);
  }

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from("collection_item_tags")
      .insert(toAdd.map((tagId) => ({ collection_item_id: itemId, tag_id: tagId })));
    // 他人の本・他人のタグは RLS 違反（42501）、存在しない ID は FK 違反
    if (error?.code === "42501" || error?.code === "23503") {
      return failure("本またはタグが見つかりません");
    }
    if (error) return dbFailure(error);
  }

  refresh();
  return success(null);
}
