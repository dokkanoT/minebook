// src/app/(dashboard)/analysis/page.tsx
import { AverageScorePanel } from "../_components/analysis/AverageScorePanel";
import { CategoryDistributionPanel } from "../_components/analysis/CategoryDistributionPanel";
import { InterestSummaryPanel } from "../_components/analysis/InterestSummaryPanel";
import { TagUsagePanel } from "../_components/analysis/TagUsagePanel";
import { PageFooter } from "../_components/layout/PageFooter";
import { PageHeader } from "../_components/layout/PageHeader";
import { StatCard } from "../_components/shared/StatCard";
import {
  ANALYSIS_META,
  ANALYSIS_TOP_CARDS,
  AVERAGE_SCORE_CHART,
  CATEGORY_DISTRIBUTION,
  INTEREST_SUMMARY,
  TAG_USAGE,
} from "../_data/analysis";

export default function AnalysisPage() {
  return (
    <>
      <PageHeader
        title="関心分析"
        description="Reading Interest Analytics — 集めた本から、いまの興味の広がりを読み解きます。"
        meta={ANALYSIS_META}
      />

      <div className="grid grid-cols-3 gap-4">
        {ANALYSIS_TOP_CARDS.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 items-stretch gap-4">
        <CategoryDistributionPanel items={CATEGORY_DISTRIBUTION} />
        <AverageScorePanel {...AVERAGE_SCORE_CHART} />
        <TagUsagePanel {...TAG_USAGE} />
        <InterestSummaryPanel {...INTEREST_SUMMARY} />
      </div>

      <PageFooter>書誌・店舗・価格・統計・スコア・タグ数はサンプルです。</PageFooter>
    </>
  );
}