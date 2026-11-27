// 登録済みの本（books）に、あとから追加した列の値を入れ直すスクリプト
// - published_date（発売日）：openBD の pubdate、なければ楽天ブックスの salesDate
// - review_average / review_count（楽天ブックスのレビュー）：楽天で見つかった本だけ最新の値に更新
//
// 使い方（.env.local の SUPABASE_SECRET_KEY と RAKUTEN_* を使う）
//   node --env-file=.env.local scripts/backfill-books.mjs          # 確認だけ（DB は変えない）
//   node --env-file=.env.local scripts/backfill-books.mjs --apply  # DB を更新する
//
// 先に `pnpm db:push` で published_date 列を追加しておくこと

import { createClient } from "@supabase/supabase-js";

import { parsePublishedDate } from "../src/lib/utils/published-date.ts";

const apply = process.argv.includes("--apply");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !secretKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SECRET_KEY が必要です（--env-file=.env.local を付けてください）");
  process.exit(1);
}
const rakutenEnv = {
  applicationId: process.env.RAKUTEN_APPLICATION_ID,
  accessKey: process.env.RAKUTEN_ACCESS_KEY,
  referer: process.env.RAKUTEN_REFERER,
};
if (!rakutenEnv.applicationId || !rakutenEnv.accessKey || !rakutenEnv.referer) {
  console.warn("RAKUTEN_* が未設定のため、レビューと楽天の発売日は取得しません");
}

const supabase = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function fetchOpenBD(isbn) {
  const res = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`openBD ${res.status}`);
  const [item] = await res.json();
  return item ? { publishedDate: parsePublishedDate(item.summary?.pubdate) } : null;
}

// src/lib/rakuten/index.ts と同じ条件で呼ぶ
async function fetchRakuten(isbn) {
  if (!rakutenEnv.applicationId || !rakutenEnv.accessKey || !rakutenEnv.referer) return null;
  const params = new URLSearchParams({
    applicationId: rakutenEnv.applicationId,
    accessKey: rakutenEnv.accessKey,
    isbn,
    format: "json",
    formatVersion: "2",
    outOfStockFlag: "1",
  });
  const res = await fetch(
    `https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404?${params}`,
    {
      headers: { Referer: rakutenEnv.referer, Origin: new URL(rakutenEnv.referer).origin },
      signal: AbortSignal.timeout(5000),
    },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Rakuten ${res.status}`);
  const [item] = (await res.json()).Items ?? [];
  if (!item?.title) return null;

  // レビューが 0 件の本は平均も "0.00" で返るので null にする（src/lib/rakuten の toReview と同じ）
  const reviewCount = Number.isInteger(item.reviewCount) && item.reviewCount > 0 ? item.reviewCount : 0;
  const average = Number.parseFloat(item.reviewAverage);
  return {
    publishedDate: parsePublishedDate(item.salesDate),
    reviewCount,
    reviewAverage: reviewCount > 0 && average >= 0 && average <= 5 ? average : null,
  };
}

const { data: books, error } = await supabase
  .from("books")
  .select("isbn, title, published_date, review_average, review_count")
  .order("created_at");
if (error) {
  console.error("books を読めませんでした:", error.message);
  process.exit(1);
}

console.log(`${books.length} 冊を確認します（${apply ? "DB を更新します" : "確認だけ。更新するには --apply"}）\n`);

let changedCount = 0;
for (const book of books) {
  const [openbd, rakuten] = await Promise.allSettled([fetchOpenBD(book.isbn), fetchRakuten(book.isbn)]);
  const o = openbd.status === "fulfilled" ? openbd.value : null;
  const r = rakuten.status === "fulfilled" ? rakuten.value : null;
  for (const [name, result] of [["openBD", openbd], ["楽天", rakuten]]) {
    if (result.status === "rejected") console.warn(`  ${book.isbn} ${name} の取得に失敗:`, result.reason.message);
  }

  const update = {};
  const publishedDate = o?.publishedDate ?? r?.publishedDate ?? null;
  if (!book.published_date && publishedDate) update.published_date = publishedDate;
  // 楽天で見つかった本だけレビューを更新する（見つからない・失敗した本は今の値のまま）
  if (r) {
    if (book.review_count !== r.reviewCount) update.review_count = r.reviewCount;
    const currentAverage = book.review_average === null ? null : Number(book.review_average);
    if (currentAverage !== r.reviewAverage) update.review_average = r.reviewAverage;
  }

  const label = `${book.isbn} ${book.title.slice(0, 20)}`;
  if (Object.keys(update).length === 0) {
    console.log(`  変更なし  ${label}`);
    continue;
  }
  changedCount++;
  console.log(`  更新${apply ? "" : "予定"}  ${label}  ${JSON.stringify(update)}`);
  if (apply) {
    const { error: updateError } = await supabase.from("books").update(update).eq("isbn", book.isbn);
    if (updateError) console.error(`    更新に失敗: ${updateError.message}`);
  }
  // 楽天の API に連続で負荷をかけないよう少し待つ
  await new Promise((resolve) => setTimeout(resolve, 1100));
}

console.log(`\n${changedCount} 冊${apply ? "を更新しました" : "が更新の対象です"}`);
