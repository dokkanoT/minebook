import "server-only";

// 2026 年の仕様変更後のエンドポイント（applicationId に加えて accessKey と Referer が必須）
const BOOKS_SEARCH_ENDPOINT =
  "https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404";

// 価格（itemPrice）は税込の販売価格で openBD の定価（税抜）と基準が違うため扱わない
export type RakutenBook = {
  isbn: string;
  title: string;
  author: string | null;
  publisher: string | null;
  description: string | null;
  coverUrl: string | null;
  // "001004008/001019001" のようなスラッシュ区切り
  genreId: string | null;
};

type RakutenResponse = {
  Items?: Array<{
    isbn: string;
    title: string;
    author: string;
    publisherName: string;
    itemCaption: string;
    largeImageUrl: string;
    booksGenreId: string;
  }>;
};

function getRakutenEnv() {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  // 楽天のアプリ設定に登録した Web サイト URL
  const referer = process.env.RAKUTEN_REFERER;
  if (!applicationId || !accessKey || !referer) return null;
  return { applicationId, accessKey, referer };
}

// 該当なし・キー未設定なら null。通信エラー時は例外
export async function fetchBookFromRakuten(
  isbn13: string,
): Promise<RakutenBook | null> {
  const env = getRakutenEnv();
  if (!env) {
    console.warn("RAKUTEN_* が未設定のため楽天ブックス API をスキップします");
    return null;
  }

  const params = new URLSearchParams({
    applicationId: env.applicationId,
    accessKey: env.accessKey,
    isbn: isbn13,
    format: "json",
    formatVersion: "2",
    // 品切れ・絶版の本も対象にする（古本が中心のため）
    outOfStockFlag: "1",
  });
  const res = await fetch(`${BOOKS_SEARCH_ENDPOINT}?${params}`, {
    headers: { Referer: env.referer },
    signal: AbortSignal.timeout(5000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Rakuten request failed: ${res.status}`);

  const [item] = ((await res.json()) as RakutenResponse).Items ?? [];
  if (!item?.title) return null;

  return {
    isbn: isbn13,
    title: item.title,
    author: item.author || null,
    publisher: item.publisherName || null,
    description: item.itemCaption || null,
    coverUrl: item.largeImageUrl || null,
    genreId: item.booksGenreId || null,
  };
}
