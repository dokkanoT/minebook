import type { Tables } from '@/types/database';

type PublishedSource = Pick<Tables<'books'>, 'published_date' | 'published_date_precision'>;

// 発売日（DB の "YYYY-MM-01" と、どこまで分かっているか）を画面の表示に変える
// - 年月まで分かる本：「2012年6月」
// - 年しか分からない本：「2012年」（月の欄は出さない）
export function toPublishedFields(book: PublishedSource) {
  const match = book.published_date?.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (!book.published_date || !match) return { publishedYear: '' };

  const [, year, month] = match;
  return {
    publishedYear: `${year}年`,
    publishedDate:
      book.published_date_precision === 'year' ? undefined : `${year}年${Number(month)}月`,
    releaseDate: book.published_date,
  };
}
