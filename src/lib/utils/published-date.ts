// 外部 API の発売日を "YYYY-MM-DD"（DB の date 型）にそろえる。読めなければ null
//
// 来る形の例
// - openBD の pubdate：      "20120615" / "201206" / "2012-06" / "2012"
// - 楽天ブックスの salesDate："2012年06月15日頃" / "2012年06月" / "2012年"
//
// 日が分からなければ 1 日、月が分からなければ 1 月 1 日にする
export function parsePublishedDate(raw: string | null | undefined): string | null {
  if (!raw) return null;

  const match =
    // 区切りなしの数字（openBD）
    raw.trim().match(/^(\d{4})(\d{2})?(\d{2})?$/) ??
    // 「-」「/」「年月日」などで区切られた形
    raw.match(/(\d{4})\D{1,2}(\d{1,2})?(?:\D{1,2}(\d{1,2}))?/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = match[2] ? Number(match[2]) : 1;
  const day = match[3] ? Number(match[3]) : 1;

  // 実在しない日付（2 月 30 日など）や、ありえない年は捨てる
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    year < 1800 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
}
