// src/app/(dashboard)/history/page.tsx
import { ScanCalendar } from "../_components/history/ScanCalendar";
import { ScanHistoryExplorer } from "../_components/history/ScanHistoryExplorer";
import { PageFooter } from "../_components/layout/PageFooter";
import { PageHeader } from "../_components/layout/PageHeader";
import { StatCard } from "../_components/shared/StatCard";
import { BarTrack } from "../_components/ui/BarTrack";
import { HISTORY_STATS, SCAN_CALENDAR, SCAN_RECORDS } from "../_data/history";

export default function HistoryPage() {
  const s = HISTORY_STATS;

  return (
    <>
      <PageHeader
        title="発見履歴"
        description="店頭でスキャンした本の記録と、本棚への保存状態を確認します。"
        meta="対象：すべてのスキャン（未保存を含む）"
      />

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,3.2fr)] gap-4">
        <StatCard
          label="今月のスキャン"
          value={String(s.monthTotal)}
          unit="冊"
          note={`うち保存 ${s.monthSaved}冊`}
        />
        <StatCard
          label="保存率"
          value={String(s.saveRate)}
          unit="%"
          note={`全期間${s.allTotal}冊中${s.allSaved}冊を保存`}
        >
          <div className="mt-2">
            <BarTrack percent={s.saveRate} label="保存率" className="h-2" />
          </div>
        </StatCard>
        <StatCard
          label="訪れた古書店"
          value={String(s.shopCount)}
          unit="店"
          note={`最多：${s.topShop}`}
        />
        <ScanCalendar {...SCAN_CALENDAR} />
      </div>

      <ScanHistoryExplorer records={SCAN_RECORDS} />

      <PageFooter>
        書誌・店舗・価格・統計・スコアはサンプルです。未保存の本は、登録冊数・ランキング・平均お宝度・カテゴリ分布に含めません。
      </PageFooter>
    </>
  );
}