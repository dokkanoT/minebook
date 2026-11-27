import { calcTreasure, type Rank } from '@/features/treasure/score';
import type { BookItem } from './types';

export type BookRank = Rank;

/** お宝度の計算に使う本の情報 */
export type TreasureSource = Pick<
  BookItem,
  'originalPrice' | 'reviewRating' | 'reviewCount' | 'releaseDate'
>;

export interface PriceEvaluationResult {
  rank: BookRank;
  /** お宝度（0〜100） */
  score: number;
  /** 定価より安い場合のみ 0〜100 の整数。定価不明・定価以上は null */
  discountPercent: number | null;
  /** 定価より安い場合のお得額（円）。定価不明・定価以上は null */
  savings: number | null;
}

/**
 * 本の情報と店頭価格から、お宝度（ランク）と割引率を計算する。
 * お宝度のルールは features/treasure/score.ts（docs/treasure-score.md）
 */
export function evaluateBookPrice(
  book: TreasureSource,
  shopPrice: number,
): PriceEvaluationResult {
  const { originalPrice } = book;
  const { rank, score } = calcTreasure({
    listPrice: originalPrice > 0 ? originalPrice : null,
    storePrice: shopPrice,
    reviewAverage: book.reviewRating ?? null,
    reviewCount: book.reviewCount ?? null,
    publishedDate: book.releaseDate ?? null,
  });

  if (originalPrice <= 0 || shopPrice >= originalPrice) {
    return { rank, score, discountPercent: null, savings: null };
  }

  const discountRate = (originalPrice - shopPrice) / originalPrice;
  return {
    rank,
    score,
    discountPercent: Math.round(discountRate * 100),
    savings: originalPrice - shopPrice,
  };
}

// TODO(スマホ担当): C・D の色は仮。決まったら差し替える
export const RANK_BADGE_BG: Record<BookRank, string> = {
  S: 'bg-amber-500',
  A: 'bg-indigo-500',
  B: 'bg-gray-600',
  C: 'bg-teal-600',
  D: 'bg-gray-400',
};
