// src/app/(dashboard)/_data/analysis.ts
import { CATEGORIES, CATEGORY_COUNTS, MOCK_BOOKS, TAGS } from "./books";

const total = MOCK_BOOKS.length;
const overall = MOCK_BOOKS.reduce((sum, b) => sum + b.score, 0) / total;

/** カテゴリ別の平均お宝度（高い順） */
const categoryAverages = CATEGORIES.map((category) => {
  const items = MOCK_BOOKS.filter((b) => b.category === category);
  return {
    label: category,
    average: items.reduce((sum, b) => sum + b.score, 0) / items.length,
  };
}).sort((a, b) => b.average - a.average);

/** タグ別の付与冊数（多い順） */
const tagCounts = TAGS.map((tag) => ({
  label: tag as string,
  count: MOCK_BOOKS.filter((b) => b.tags.includes(tag)).length,
})).sort((a, b) => b.count - a.count);

const topCategory = CATEGORY_COUNTS[0];
const topScoreCategory = categoryAverages[0];
const topTag = tagCounts[0];
const diff = topScoreCategory.average - overall;

export const ANALYSIS_META = `対象：本棚に保存済みの本 ${total}冊`;

export const ANALYSIS_TOP_CARDS = [
  {
    label: "いちばん多いカテゴリ",
    value: topCategory.label,
    note: `${topCategory.count}冊 / 保存本の${((topCategory.count / total) * 100).toFixed(1)}%`,
  },
  {
    label: "お宝度が高いカテゴリ",
    value: topScoreCategory.label,
    note: `平均 ${topScoreCategory.average.toFixed(1)} / 全体平均より ${diff >= 0 ? "+" : "-"}${Math.abs(diff).toFixed(1)}（例）`,
  },
  {
    label: "よく付けるタグ",
    value: topTag.label,
    note: `${topTag.count}冊に付与`,
  },
];

export const CATEGORY_DISTRIBUTION = CATEGORY_COUNTS;

export const AVERAGE_SCORE_CHART = {
  rows: categoryAverages,
  overall,
  min: 60,
  max: 90,
};

export const TAG_USAGE = {
  tags: tagCounts,
  registeredCount: TAGS.length,
};

/** 解釈テキスト（サンプル） */
export const INTEREST_SUMMARY = {
  headline: `数は${topCategory.label}、お宝は${topScoreCategory.label}。`,
  body: `${topCategory.label}は${topCategory.count}冊で保存本の約3分の1を占めています。一方で平均お宝度が最も高いのは${topScoreCategory.label}。数を集めている分野と、掘り出し物に出会っている分野が少しずれています。`,
  note: "収集傾向の分析です。読了・読書実績を示すものではありません。読取済み・未保存の本は、すべての統計から除外しています。",
};