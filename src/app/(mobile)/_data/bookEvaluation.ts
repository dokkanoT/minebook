export type BookRank = 'S' | 'A' | 'B';

export interface PriceEvaluationResult {
  rank: BookRank;
  /** 定価より安い場合のみ 0〜100 の整数。定価不明・定価以上は null */
  discountPercent: number | null;
  /** 定価より安い場合のお得額（円）。定価不明・定価以上は null */
  savings: number | null;
}

/**
 * 定価と店頭価格から仮のお宝ランクと割引率を計算する
 */
export function evaluateBookPrice(
  originalPrice: number,
  shopPrice: number,
): PriceEvaluationResult {
  if (originalPrice <= 0) {
    return {
      rank: 'B',
      discountPercent: null,
      savings: null,
    };
  }

  const discountRate = (originalPrice - shopPrice) / originalPrice;
  let rank: BookRank = 'B';
  if (discountRate >= 0.75) {
    rank = 'S';
  } else if (discountRate >= 0.5) {
    rank = 'A';
  }

  const isDiscounted = shopPrice < originalPrice;
  return {
    rank,
    discountPercent: isDiscounted ? Math.round(discountRate * 100) : null,
    savings: isDiscounted ? originalPrice - shopPrice : null,
  };
}

export const RANK_BADGE_BG: Record<BookRank, string> = {
  S: 'bg-amber-500',
  A: 'bg-indigo-500',
  B: 'bg-gray-600',
};
