// src/app/(dashboard)/dashboard/_data/dashboard.ts
import { CATEGORY_COUNTS, MOCK_BOOKS, MOCK_COLLECTION_COUNT } from "./books";
import { UNSAVED_SCAN_COUNT } from "./history";

/** 保存冊数の月別推移（サンプル。合計は登録冊数と一致） */
export const MONTHLY_6M = [
  { label: "5月", count: 1 },
  { label: "6月", count: 2 },
  { label: "7月", count: 1 },
  { label: "8月", count: 2 },
  { label: "9月", count: 2 },
  { label: "10月", count: 4 },
];

export const MONTHLY_1Y = [
  { label: "11月", count: 0 },
  { label: "12月", count: 0 },
  { label: "1月", count: 0 },
  { label: "2月", count: 0 },
  { label: "3月", count: 0 },
  { label: "4月", count: 0 },
  ...MONTHLY_6M,
];

const scores = MOCK_BOOKS.map((b) => b.score);
const total = MOCK_BOOKS.length;

export const DASHBOARD_STATS = {
  total,
  thisMonth: MONTHLY_6M[MONTHLY_6M.length - 1].count,
  monthlyCounts: MONTHLY_6M.map((m) => m.count),
  average: (scores.reduce((sum, s) => sum + s, 0) / total).toFixed(1),
  maxScore: Math.max(...scores),
  minScore: Math.min(...scores),
  /** 60台・70台・80台・90台の冊数 */
  scoreBuckets: [60, 70, 80, 90].map(
    (from) => scores.filter((s) => s >= from && s < from + 10).length,
  ),
  collectionCount: MOCK_COLLECTION_COUNT,
  categoryCount: CATEGORY_COUNTS.length,
  categoryCounts: CATEGORY_COUNTS.map((c) => c.count),
};

export const FREQUENT_SHOPS = [
  { name: "神保町 ひだまり書房", count: 5 },
  { name: "西荻窪 しおり古書店", count: 4 },
  { name: "吉祥寺 森の本屋", count: 3 },
];

export const QUICK_LINKS = [
  { href: "/dashboard/bookshelf", title: "本棚を見る", description: `${total}冊を検索・並び替え` },
  { href: "/dashboard/collection", title: "コレクションを整理", description: `${MOCK_COLLECTION_COUNT}件の編集とタグ管理` },
  { href: "/dashboard/ranking", title: "ランキングを見る", description: "読書家の価値で本を比較" },
  {
    href: "/dashboard/history",
    title: "発見履歴を見る",
    description: "スキャン・店舗・価格を確認",
    badge: `未保存 ${UNSAVED_SCAN_COUNT}`,
  },
  { href: "/dashboard/analysis", title: "関心分析を見る", description: "統計と収集傾向を確認" },
];

export const RECENT_BOOKS = MOCK_BOOKS.slice(0, 4);