// src/app/(dashboard)/_components/dashboard/FrequentShopsPanel.tsx
import { ArrowLink } from "../ui/ArrowLink";
import { Panel } from "../ui/Panel";
import { ProgressBar } from "../ui/ProgressBar";

type Shop = { name: string; count: number };

export function FrequentShopsPanel({ shops }: { shops: Shop[] }) {
  const max = Math.max(...shops.map((s) => s.count), 1);

  return (
    <Panel
      title="よく行く古書店"
      description={`保存した本の購入店 上位${shops.length}店`}
      className="flex h-full flex-col"
    >
      <ol className="space-y-4">
        {shops.map((shop, i) => (
          <li key={shop.name}>
            <ProgressBar
              rank={i + 1}
              label={shop.name}
              percent={(shop.count / max) * 100}
              valueLabel={`${shop.count}冊`}
              emphasizeValue
            />
          </li>
        ))}
      </ol>
      <div className="mt-auto pt-6">
        <ArrowLink href="/history">発見履歴で詳しく見る</ArrowLink>
      </div>
    </Panel>
  );
}