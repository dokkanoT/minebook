// src/app/(dashboard)/_components/history/ScanTable.tsx
import { Badge } from "../ui/Badge";
import { Panel } from "../ui/Panel";

export type ScanRecord = {
  id: string;
  /** "2026/10/14 10:32" 形式 */
  scannedAt: string;
  title: string;
  shop: string;
  price: number;
  result: string;
  status: "saved" | "unsaved";
};

const HEAD_CLASS = "px-3 py-3 text-left text-xs font-bold";

export function ScanTable({ records }: { records: ScanRecord[] }) {
  return (
    <Panel
      title="スキャン記録"
      action={
        <p className="text-xs text-neutral-600">
          {records.length}件を表示 / スキャン日時の新しい順
        </p>
      }
    >
      <table className="w-full border-collapse text-sm">
        <thead className="bg-neutral-200">
          <tr>
            <th className={HEAD_CLASS}>スキャン日時</th>
            <th className={HEAD_CLASS}>書籍タイトル</th>
            <th className={HEAD_CLASS}>店舗名</th>
            <th className={HEAD_CLASS}>入力価格</th>
            <th className={HEAD_CLASS}>判定結果（例）</th>
            <th className={HEAD_CLASS}>保存状態</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-10 text-center text-xs text-neutral-500">
                条件に一致するスキャン記録はありません。
              </td>
            </tr>
          ) : (
            records.map((r) => (
              <tr key={r.id} className="border-b border-neutral-200">
                <td className="px-3 py-4 text-xs tabular-nums">{r.scannedAt}</td>
                <td className="px-3 py-4 font-bold">{r.title}</td>
                <td className="px-3 py-4 text-xs">{r.shop}</td>
                <td className="px-3 py-4 text-xs tabular-nums">¥{r.price.toLocaleString("ja-JP")}</td>
                <td className="px-3 py-4 text-xs">{r.result}</td>
                <td className="px-3 py-4">
                  {r.status === "saved" ? (
                    <Badge variant="strong">本棚保存済み</Badge>
                  ) : (
                    <Badge variant="outline">読取済み・未保存</Badge>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Panel>
  );
}