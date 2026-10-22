"use server";

import { requireUser } from "@/features/auth/dal";
import { normalizeIsbn } from "@/lib/utils/isbn";

import { getOrCreateBook, type Book } from "./server";

export type LookupBookResult =
  | { ok: true; book: Book }
  | { ok: false; error: "invalid_isbn" | "not_found" | "lookup_failed" };

// スキャンした ISBN から書籍情報を取得する（初出の本は books に登録される）
export async function lookupBook(isbn: string): Promise<LookupBookResult> {
  await requireUser();

  const isbn13 = normalizeIsbn(isbn);
  if (!isbn13) return { ok: false, error: "invalid_isbn" };

  try {
    const book = await getOrCreateBook(isbn13);
    return book ? { ok: true, book } : { ok: false, error: "not_found" };
  } catch (e) {
    console.error("lookupBook failed", e);
    return { ok: false, error: "lookup_failed" };
  }
}
