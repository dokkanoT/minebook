"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/features/auth/dal";
import { getOrCreateBook } from "@/features/books/server";
import { createClient } from "@/lib/supabase/server";
import {
  dbFailure,
  failure,
  invalidInput,
  success,
  type ActionResult,
} from "@/lib/utils/action-result";
import { normalizeIsbn } from "@/lib/utils/isbn";
import { idSchema, optionalText, optionalYen } from "@/lib/utils/schemas";

const SHELF_NOT_FOUND = "指定した本棚が見つかりません";

// 追加・更新で共通の項目（すべて任意）
const detailsSchema = z.object({
  shelfId: idSchema.nullish(),
  storePrice: optionalYen,
  storeName: optionalText(50),
  purchaseDate: z.iso.date("日付の形式が正しくありません").nullish(),
  notes: optionalText(1000),
  status: optionalText(20),
});

const addSchema = detailsSchema.extend({
  isbn: z.string().min(1, "ISBN を入力してください"),
});

// スキャンした本をコレクションに追加する（初出の本は books にも登録される）
export async function addToCollection(
  input: z.input<typeof addSchema>,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);
  const { isbn, ...details } = parsed.data;

  const isbn13 = normalizeIsbn(isbn);
  if (!isbn13) return failure("ISBN が正しくありません");

  let book;
  try {
    book = await getOrCreateBook(isbn13);
  } catch (e) {
    console.error("addToCollection: book lookup failed", e);
    return failure("書籍情報の取得に失敗しました。時間をおいて再度お試しください");
  }
  if (!book) return failure("書籍情報が見つかりませんでした");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collection_items")
    .insert({ user_id: user.id, isbn: book.isbn, ...toColumns(details) })
    .select("id")
    .single();
  // 他人の本棚を指定した場合は RLS 違反（42501）になる
  if (error?.code === "42501") return failure(SHELF_NOT_FOUND);
  if (error) return dbFailure(error, { foreignKey: SHELF_NOT_FOUND });

  refresh();
  return success({ id: data.id });
}

const updateSchema = detailsSchema.partial().extend({ id: idSchema });

// 渡した項目だけ更新する（null を渡すとその項目を空にする）
export async function updateCollectionItem(
  input: z.input<typeof updateSchema>,
): Promise<ActionResult> {
  await requireUser();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);
  const { id, ...details } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collection_items")
    .update(toColumns(details))
    .eq("id", id)
    .select("id");
  if (error?.code === "42501") return failure(SHELF_NOT_FOUND);
  if (error) return dbFailure(error, { foreignKey: SHELF_NOT_FOUND });
  if (data.length === 0) return failure("本が見つかりません");

  refresh();
  return success(null);
}

const removeSchema = z.object({ id: idSchema });

export async function removeFromCollection(
  input: z.input<typeof removeSchema>,
): Promise<ActionResult> {
  await requireUser();
  const parsed = removeSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collection_items")
    .delete()
    .eq("id", parsed.data.id)
    .select("id");
  if (error) return dbFailure(error);
  if (data.length === 0) return failure("本が見つかりません");

  refresh();
  return success(null);
}

// camelCase の入力を DB のカラム名に変換（undefined の項目は含めない＝更新しない）
function toColumns(details: Partial<z.output<typeof detailsSchema>>) {
  const columns = {
    shelf_id: details.shelfId,
    store_price: details.storePrice,
    store_name: details.storeName,
    purchase_date: details.purchaseDate,
    notes: details.notes,
    status: details.status,
  };
  return Object.fromEntries(
    Object.entries(columns).filter(([, v]) => v !== undefined),
  ) as Partial<typeof columns>;
}
