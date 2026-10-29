// src/app/(dashboard)/_data/ranking.ts
import type { RankingRow } from "../_components/ranking/RankingTable";
import { MOCK_BOOKS } from "./books";

const RANKING_LIMIT = 5;

export const RANKING_TOTAL = MOCK_BOOKS.length;

export const RANKING_ROWS: RankingRow[] = [...MOCK_BOOKS]
  .sort((a, b) => b.score - a.score)
  .slice(0, RANKING_LIMIT)
  .map((book, i) => ({
    id: book.id,
    rank: i + 1,
    title: book.title,
    author: book.author,
    category: book.category,
    score: book.score,
  }));

export const SCORE_EXPLANATION = {
  description: "価格だけではなく、読書家にとっての価値を捉えるための指標です。",
  criteria: [
    { title: "希少性", description: "手に入りにくさに着目します。" },
    { title: "隠れた名作度", description: "広く知られていない良書としての価値に着目します。" },
    { title: "お得度", description: "入力価格に対する価値に着目します。" },
  ],
  pendingTitle: "評価方法は検討中",
  pendingBody:
    "計算方法・配点・重み・市場データソース・S/A/B/Cの閾値は未定です。確定した評価やランクを示すものではありません。",
  footnote: "読取済み・未保存の本はランキングに含めません。",
};