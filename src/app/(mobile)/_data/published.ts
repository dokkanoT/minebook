// 発売日（DB の "YYYY-MM-DD"）を画面の表示に変える
// 月までしか分からない本も 1 日として保存しているので、表示は年月までにする
export function toPublishedFields(publishedDate: string | null) {
  const match = publishedDate?.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (!publishedDate || !match) return { publishedYear: '' };

  const [, year, month] = match;
  return {
    publishedYear: `${year}年`,
    publishedDate: `${year}年${Number(month)}月`,
    releaseDate: publishedDate,
  };
}
