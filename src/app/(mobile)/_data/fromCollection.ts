import type { CollectionItem } from '@/features/collection/server';
import { evaluateBookPrice } from './bookEvaluation';
import { toPublishedFields } from './published';
import type { BookItem, FlagType } from './types';

const FLAGS: readonly FlagType[] = ['purchased', 'pending', 'skip'];

// スキャン日はサーバー（UTC）で整形しても日本の日付になるようにする
const scanDateFormat = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

// 保存済みの本（collection_items + books）を、スマホ画面の BookItem に変換する
export function toBookItem(item: CollectionItem): BookItem {
  const { book } = item;
  const originalPrice = book.list_price ?? 0;
  // 店頭価格が入っていれば判定済み。お宝度は保存せず、毎回計算する
  const isEvaluated = item.store_price !== null;
  const published = toPublishedFields(book.published_date);
  const reviewRating = book.review_average ?? undefined;
  const reviewCount = book.review_count ?? undefined;

  return {
    id: item.id,
    collectionItemId: item.id,
    isMock: false,
    title: book.title,
    author: book.author ?? '不明',
    coverUrl: book.cover_url ?? undefined,
    scanDate: scanDateFormat.format(new Date(item.scanned_at)),
    categoryTag: book.category ?? undefined,
    originalPrice,
    shopPrice: item.store_price ?? 0,
    isEvaluated,
    rank:
      item.store_price !== null
        ? evaluateBookPrice(
            { originalPrice, reviewRating, reviewCount, releaseDate: published.releaseDate },
            item.store_price,
          ).rank
        : undefined,
    storeName: item.store_name ?? '未登録',
    isbn: item.isbn,
    ...published,
    publisher: book.publisher ?? '情報なし',
    description: book.description ?? 'あらすじ情報はありません。',
    reviewRating,
    reviewCount,
    reviewSource: '楽天ブックス',
    flag: FLAGS.find((flag) => flag === item.status) ?? 'none',
  };
}
