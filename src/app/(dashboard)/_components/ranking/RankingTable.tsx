// src/app/(dashboard)/_components/ranking/RankingTable.tsx
import { BarTrack } from "../ui/BarTrack";
import { BookThumb } from "../ui/BookThumb";
import { Panel } from "../ui/Panel";

export type RankingRow = {
  id: string;
  rank: number;
  title: string;
  author: string;
  category: string;
  score: number;
};

type RankingTableProps = {
  rows: RankingRow[];
  /** 保存済みの全冊数 */
  totalCount: number;
};

const HEAD_CLASS = "px-3 py-3 text-left text-xs font-bold";

export function RankingTable({ rows, totalCount }: RankingTableProps) {
  return (
    <Panel
      title="お宝度ランキング"
      action={
        <p className="text-xs text-neutral-600">
          保存済み{totalCount}冊の上位{rows.length}冊
        </p>
      }
    >
      <table className="w-full border-collapse text-sm">
        <thead className="bg-neutral-200">
          <tr>
            <th scope="col" className={`${HEAD_CLASS} w-20`}>順位</th>
            <th scope="col" className={`${HEAD_CLASS} w-24`}>書影</th>
            <th scope="col" className={HEAD_CLASS}>書籍 / 著者</th>
            <th scope="col" className={`${HEAD_CLASS} w-40`}>カテゴリ</th>
            <th scope="col" className={`${HEAD_CLASS} w-56`}>スコア（例）</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-10 text-center text-xs text-neutral-500">
                ランキングに表示できる本がありません。
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-b border-neutral-200">
                <td className="px-3 py-5 text-xl font-bold tabular-nums">{row.rank}</td>
                <td className="px-3 py-5">
                  <BookThumb />
                </td>
                <td className="px-3 py-5">
                  <p className="font-bold">{row.title}</p>
                  <p className="mt-1 text-xs text-neutral-600">{row.author}</p>
                </td>
                <td className="px-3 py-5 text-xs text-neutral-700">{row.category}</td>
                <td className="px-3 py-5">
                  <p className="text-2xl font-bold leading-none tabular-nums">{row.score}</p>
                  <div className="mt-2 w-28">
                    <BarTrack percent={row.score} label={`${row.title}のスコア`} className="h-1" />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-neutral-600">
        上位{rows.length}冊を表示 / 数値はサンプルの比較表示です。
      </p>
    </Panel>
  );
}