// src/app/(dashboard)/_components/history/ScanFilterPanel.tsx
import { Panel } from "../ui/Panel";

export type ScanStatusFilter = "all" | "saved" | "unsaved";

type ScanFilterPanelProps = {
  keyword: string;
  date: string;
  status: ScanStatusFilter;
  dateOptions: string[];
  onKeywordChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onStatusChange: (value: ScanStatusFilter) => void;
  onReset: () => void;
};

const FIELD_CLASS =
  "h-10 w-full rounded-sm border border-neutral-300 bg-white px-3 text-sm focus:border-neutral-500 focus:outline-none";

export function ScanFilterPanel({
  keyword,
  date,
  status,
  dateOptions,
  onKeywordChange,
  onDateChange,
  onStatusChange,
  onReset,
}: ScanFilterPanelProps) {
  return (
    <Panel title="検索・絞り込み">
      <div className="grid grid-cols-[minmax(0,1fr)_11rem_11rem_auto] items-end gap-3">
        <label className="block">
          <span className="mb-1 block text-[11px] text-neutral-600">キーワード</span>
          <input
            type="search"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="書籍タイトル・店舗名で検索"
            className={`${FIELD_CLASS} placeholder:text-neutral-500`}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] text-neutral-600">日付</span>
          <select value={date} onChange={(e) => onDateChange(e.target.value)} className={FIELD_CLASS}>
            <option value="all">すべて</option>
            {dateOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] text-neutral-600">保存状態</span>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as ScanStatusFilter)}
            className={FIELD_CLASS}
          >
            <option value="all">すべて</option>
            <option value="saved">本棚保存済み</option>
            <option value="unsaved">読取済み・未保存</option>
          </select>
        </label>

        <button
          type="button"
          onClick={onReset}
          className="h-10 rounded-sm border border-neutral-300 bg-white px-4 text-sm hover:bg-neutral-50"
        >
          条件をリセット
        </button>
      </div>
    </Panel>
  );
}