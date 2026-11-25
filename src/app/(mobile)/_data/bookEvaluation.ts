import { calcRank, type Rank } from './rank';

export type BookRank = Rank;

export interface PriceEvaluationResult {
  rank: BookRank;
  /** 定価より安い場合のみ 0〜100 の整数。定価不明・定価以上は null */
  discountPercent: number | null;
  /** 定価より安い場合のお得額（円）。定価不明・定価以上は null */
  savings: number | null;
}

/**
 * 定価と店頭価格からランク（mainのcalcRank準拠）と割引率を計算する
 */
export function evaluateBookPrice(
  originalPrice: number,
  shopPrice: number,
): PriceEvaluationResult {
  const rank = calcRank(originalPrice, shopPrice);

  if (originalPrice <= 0 || shopPrice >= originalPrice) {
    return {
      rank,
      discountPercent: null,
      savings: null,
    };
  }

  const discountRate = (originalPrice - shopPrice) / originalPrice;
  return {
    rank,
    discountPercent: Math.round(discountRate * 100),
    savings: originalPrice - shopPrice,
  };
}

export const RANK_BADGE_BG: Record<BookRank, string> = {
  S: 'bg-amber-500',
  A: 'bg-indigo-500',
  B: 'bg-gray-600',
};
