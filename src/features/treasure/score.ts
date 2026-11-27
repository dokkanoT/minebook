// お宝度（掘り出し物度）の計算。ルールは docs/treasure-score.md
//
// お宝度 = 本の価値 × (0.35 + 0.65 × お得さ) × 1.25   （0〜100）
// - 本の価値：レビューの評価と希少性（レビュー件数・発売からの年数）、プレミア価格の加点
// - お得さ：税込の定価からどれだけ安いか
//
// 画面（サーバー・ブラウザどちら）からも呼べるよう、DB や外部 API には触らない純粋な関数にしている

export const RANKS = ["S", "A", "B", "C", "D"] as const;
export type Rank = (typeof RANKS)[number];

// ランクの下限（この点数以上でそのランク）。調整するときはここだけ変える
export const RANK_THRESHOLDS: Record<Exclude<Rank, "D">, number> = {
  S: 65,
  A: 50,
  B: 35,
  C: 20,
};

export type TreasureInput = {
  /** 定価（税抜。openBD の本体価格）。分からなければ null */
  listPrice: number | null;
  /** 店頭価格（税込） */
  storePrice: number;
  /** 楽天ブックスのレビュー平均（0〜5）。レビューがなければ null */
  reviewAverage: number | null;
  /** 楽天ブックスのレビュー件数。楽天で見つからない本は null */
  reviewCount: number | null;
  /** 発売日 "YYYY-MM-DD"。分からなければ null */
  publishedDate: string | null;
};

export type TreasureResult = {
  /** お宝度（0〜100 の整数） */
  score: number;
  rank: Rank;
  /** 本の価値（0〜100） */
  value: number;
  /** お得さ（0〜1）。定価が分からなければ 0.5 */
  bargain: number;
};

const TAX_RATE = 1.1;
// ベイズ平均：レビューが少ないうちは、平均を相場（★3.5）に寄せる。5 件分の重み
const PRIOR_RATING = 3.5;
const PRIOR_WEIGHT = 5;

const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));

/** 評価の点数（0〜100）。★3.0 以下で 0、★5.0 で 100。レビューがなければ ★3.5 扱いで 25 */
export function reviewPoints(average: number | null, count: number | null): number {
  const n = count ?? 0;
  const adjusted =
    n > 0 && average !== null
      ? (n * average + PRIOR_WEIGHT * PRIOR_RATING) / (n + PRIOR_WEIGHT)
      : PRIOR_RATING;
  return clamp((adjusted - 3) / 2, 0, 1) * 100;
}

/** レビュー件数の点数。少ないほど出回っていない。情報がない本は「普通」の 50 */
function reviewCountPoints(count: number | null): number {
  if (count === null || count === 0) return 50;
  if (count < 10) return 60;
  if (count < 100) return 40;
  if (count < 1000) return 15;
  return 0;
}

/** 発売からの年数の点数。古いほど高い。分からない本は 50 */
function agePoints(publishedDate: string | null, now: Date): number {
  if (!publishedDate) return 50;
  const published = new Date(`${publishedDate}T00:00:00Z`);
  if (Number.isNaN(published.getTime())) return 50;

  const years = (now.getTime() - published.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (years >= 30) return 100;
  if (years >= 20) return 75;
  if (years >= 10) return 50;
  if (years >= 5) return 25;
  return 0;
}

/** 希少性の点数（0〜100）：レビュー件数と年数の点数の平均 */
export function rarityPoints(
  reviewCount: number | null,
  publishedDate: string | null,
  now: Date,
): number {
  return (reviewCountPoints(reviewCount) + agePoints(publishedDate, now)) / 2;
}

export function rankOf(score: number): Rank {
  if (score >= RANK_THRESHOLDS.S) return "S";
  if (score >= RANK_THRESHOLDS.A) return "A";
  if (score >= RANK_THRESHOLDS.B) return "B";
  if (score >= RANK_THRESHOLDS.C) return "C";
  return "D";
}

/**
 * お宝度を計算する。店頭価格が決まっていない本（未評価）には呼ばない
 * @param now 発売からの年数の基準日。省略すると今
 */
export function calcTreasure(input: TreasureInput, now: Date = new Date()): TreasureResult {
  const listPriceTaxIn =
    input.listPrice !== null && input.listPrice > 0 ? input.listPrice * TAX_RATE : null;

  // 定価より高く売られている（プレミア価格）＝市場が価値を認めている。定価の 2 倍で最大 30 点
  const premium =
    listPriceTaxIn !== null && input.storePrice > listPriceTaxIn
      ? Math.min(1, input.storePrice / listPriceTaxIn - 1) * 30
      : 0;

  const value = clamp(
    reviewPoints(input.reviewAverage, input.reviewCount) * 0.6 +
      rarityPoints(input.reviewCount, input.publishedDate, now) * 0.4 +
      premium,
    0,
    100,
  );
  const bargain =
    listPriceTaxIn !== null ? clamp(1 - input.storePrice / listPriceTaxIn, 0, 1) : 0.5;

  const score = Math.round(clamp(value * (0.35 + 0.65 * bargain) * 1.25, 0, 100));
  return { score, rank: rankOf(score), value, bargain };
}
