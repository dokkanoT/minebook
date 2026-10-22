import "server-only";

import { fetchBookFromOpenBD } from "@/lib/openbd";
import { fetchBookFromRakuten } from "@/lib/rakuten";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

import { categoryFromRakutenGenre } from "./category";

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

  const fetched = await fetchBookData(isbn13);
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
        rakuten_genre_id: fetched.rakutenGenreId,
        category: categoryFromRakutenGenre(fetched.rakutenGenreId),
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

// openBD（書誌が詳しい・定価あり）を優先し、足りない項目とジャンルを楽天で補う。
// 片方の API が落ちていても、もう片方で取れれば登録する
async function fetchBookData(isbn13: string) {
  const [openbd, rakuten] = await Promise.allSettled([
    fetchBookFromOpenBD(isbn13),
    fetchBookFromRakuten(isbn13),
  ]);
  if (openbd.status === "rejected" && rakuten.status === "rejected") {
    throw new AggregateError([openbd.reason, rakuten.reason]);
  }

  const o = openbd.status === "fulfilled" ? openbd.value : null;
  const r = rakuten.status === "fulfilled" ? rakuten.value : null;
  const title = o?.title ?? r?.title;
  if (!title) return null;

  return {
    isbn: isbn13,
    title,
    author: o?.author ?? r?.author ?? null,
    publisher: o?.publisher ?? r?.publisher ?? null,
    description: o?.description ?? r?.description ?? null,
    coverUrl: o?.coverUrl ?? r?.coverUrl ?? null,
    listPrice: o?.listPrice ?? null,
    rakutenGenreId: r?.genreId ?? null,
  };
}
