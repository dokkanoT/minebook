import "server-only";

import { fetchBookFromOpenBD } from "@/lib/openbd";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Book = Tables<"books">;

// books に無ければ openBD から取得して登録する。見つからなければ null。
// 外部 API 呼び出しと書き込みを伴うため、呼び出し元で必ず認証済みであることを確認すること
export async function getOrCreateBook(isbn13: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data: existing, error: selectError } = await supabase
    .from("books")
    .select("*")
    .eq("isbn", isbn13)
    .maybeSingle();
  if (selectError) throw selectError;
  if (existing) return existing;

  const fetched = await fetchBookFromOpenBD(isbn13);
  if (!fetched) return null;

  // books はクライアントから書き込めないため、サーバーの管理用クライアントで登録する
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("books")
    .upsert(
      {
        isbn: fetched.isbn,
        title: fetched.title,
        author: fetched.author,
        publisher: fetched.publisher,
        description: fetched.description,
        cover_url: fetched.coverUrl,
        list_price: fetched.listPrice,
      },
      // 同時スキャンで競合しても既存行を優先
      { onConflict: "isbn", ignoreDuplicates: true },
    )
    .select()
    .maybeSingle();
  if (error) throw error;

  // ignoreDuplicates で競合した場合は行が返らないので読み直す
  if (data) return data;
  const { data: raced } = await supabase
    .from("books")
    .select("*")
    .eq("isbn", isbn13)
    .single();
  return raced;
}
