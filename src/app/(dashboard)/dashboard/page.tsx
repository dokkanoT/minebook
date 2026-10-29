// src/app/(dashboard)/dashboard/page.tsx
import { FrequentShopsPanel } from "./_components/dashboard/FrequentShopsPanel";
import { MiniBarChart } from "./_components/dashboard/MiniBarChart";
import { MiniDonut } from "./_components/dashboard/MiniDonut";
import { MonthlySavedChart } from "./_components/dashboard/MonthlySavedChart";
import { QuickLinkCard } from "./_components/dashboard/QuickLinkCard";
import { RecentBooksPanel } from "./_components/dashboard/RecentBooksPanel";
import { PageFooter } from "./_components/layout/PageFooter";
import { PageHeader } from "./_components/layout/PageHeader";
import { StatCard } from "./_components/shared/StatCard";
import { Badge } from "./_components/ui/Badge";
import {
  DASHBOARD_STATS,
  FREQUENT_SHOPS,
  MONTHLY_1Y,
  MONTHLY_6M,
  QUICK_LINKS,
  RECENT_BOOKS,
} from "./_data/dashboard";

// TODO: バックエンド接続後は features/○○/server.ts の関数に差し替える。
// 非同期データを取る部分は <Suspense> で包むこと。
export default function DashboardPage() {
  const s = DASHBOARD_STATS;

  return (
    <>
      <PageHeader
        title="ダッシュボード"
        description="保存した本を整理し、次に確認したい内容へ進むための入口です。"
        meta="集計対象：本棚に保存済みの本"
      />

      <h2 className="mb-3 text-base font-bold">ユーザー統計</h2>
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="登録冊数"
          value={String(s.total)}
          unit="冊"
          badge={<Badge variant="muted">今月 +{s.thisMonth}</Badge>}
          aside={<MiniBarChart values={s.monthlyCounts} highlight="last" label="直近6か月の保存冊数" />}
          note="直近6か月の推移 / 未保存は除外"
        />
        <StatCard
          label="平均お宝度"
          value={s.average}
          unit="/ 100"
          aside={<MiniBarChart values={s.scoreBuckets} label="お宝度の分布" />}
          note={`最高 ${s.maxScore} / 分布 ${s.minScore}〜100（例）`}
        />
        <StatCard
          label="コレクション数"
          value={String(s.collectionCount)}
          unit="件"
          note="作成済みのコレクション"
        />
        <StatCard
          label="カテゴリ数"
          value={String(s.categoryCount)}
          unit="種類"
          aside={<MiniDonut values={s.categoryCounts} label="カテゴリの内訳" />}
          note="内訳は「関心分析」で確認"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <MonthlySavedChart sixMonths={MONTHLY_6M} oneYear={MONTHLY_1Y} />
        </div>
        <FrequentShopsPanel shops={FREQUENT_SHOPS} />
      </div>

      <div className="mt-4 grid grid-cols-5 gap-4">
        {QUICK_LINKS.map((link) => (
          <QuickLinkCard key={link.href} {...link} />
        ))}
      </div>

      <div className="mt-4">
        <RecentBooksPanel books={RECENT_BOOKS} />
      </div>

      <PageFooter>表示する統計・書籍・店舗・価格・スコアはサンプルです。</PageFooter>
    </>
  );
}