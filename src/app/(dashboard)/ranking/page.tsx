// src/app/(dashboard)/ranking/page.tsx
import { PageFooter } from "../_components/layout/PageFooter";
import { PageHeader } from "../_components/layout/PageHeader";
import { RankingTable } from "../_components/ranking/RankingTable";
import { ScoreExplanationPanel } from "../_components/ranking/ScoreExplanationPanel";
import { RANKING_ROWS, RANKING_TOTAL, SCORE_EXPLANATION } from "../_data/ranking";

export default function RankingPage() {
  return (
    <>
      <PageHeader
        title="ランキング"
        description="保存した本のお宝度を比較し、読書家にとっての価値を確認します。"
        meta="対象：本棚に保存済みの本"
      />

      <div className="grid grid-cols-[minmax(0,1fr)_20rem] items-start gap-4">
        <RankingTable rows={RANKING_ROWS} totalCount={RANKING_TOTAL} />
        <ScoreExplanationPanel {...SCORE_EXPLANATION} />
      </div>

      <PageFooter>書誌・店舗・価格・統計・スコアはサンプルです。</PageFooter>
    </>
  );
}