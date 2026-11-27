import type { CollectionItem } from '@/features/collection/server';
import { calcRank } from './rank';
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
  // 店頭価格が入っていれば判定済み。ランクは保存せず、毎回 calcRank で出す
  const isEvaluated = item.store_price !== null;

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
        ? calcRank(originalPrice, item.store_price)
        : undefined,
    storeName: item.store_name ?? '未登録',
    isbn: item.isbn,
    publishedYear: '',
    publisher: book.publisher ?? '情報なし',
    description: book.description ?? 'あらすじ情報はありません。',
    reviewRating: book.review_average ?? undefined,
    reviewCount: book.review_count ?? undefined,
    reviewSource: '楽天ブックス',
    flag: FLAGS.find((flag) => flag === item.status) ?? 'none',
  };
}
