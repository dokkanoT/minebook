// 外部 API の発売日を年月までにそろえる
//
// 来る形の例
// - openBD の pubdate：      "20120615" / "201206" / "2012-06" / "2012"
// - 楽天ブックスの salesDate："2012年06月15日頃" / "2012年06月" / "2012年"
//
// 日は API によって有ったり無かったりするので使わない。
// date は DB の date 型に入れる "YYYY-MM-01"（年しか分からなければ "YYYY-01-01"）、
// precision はどこまで分かっているか（DB の published_date_precision）

export type PublishedDatePrecision = "year" | "month";

export type PublishedDate = {
  date: string;
  precision: PublishedDatePrecision;
};

// 読めなければ null
export function parsePublishedDate(raw: string | null | undefined): PublishedDate | null {
  if (!raw) return null;

  const match =
    // 区切りなしの数字（openBD）
    raw.trim().match(/^(\d{4})(\d{2})?(?:\d{2})?$/) ??
    // 「-」「/」「年月日」などで区切られた形
    raw.match(/(\d{4})\D{1,2}(\d{1,2})?/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = match[2] ? Number(match[2]) : null;

  // ありえない年・月は捨てる
  if (year < 1800 || (month !== null && (month < 1 || month > 12))) return null;

  return month === null
    ? { date: `${year}-01-01`, precision: "year" }
    : { date: `${year}-${String(month).padStart(2, "0")}-01`, precision: "month" };
}

// openBD を優先する。ただし openBD が年までで、楽天が月まで分かるなら楽天を使う
export function pickPublishedDate(
  openbd: PublishedDate | null | undefined,
  rakuten: PublishedDate | null | undefined,
): PublishedDate | null {
  if (openbd?.precision === "year" && rakuten?.precision === "month") return rakuten;
  return openbd ?? rakuten ?? null;
}
