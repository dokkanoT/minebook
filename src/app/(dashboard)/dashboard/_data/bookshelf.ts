// src/app/(dashboard)/_data/bookshelf.ts
// 本棚画面の説明文（本や棚のデータは DB から取得する。fromBookshelf.ts を参照）
import type { RuleItem } from "../_components/bookshelf/OperationRulesPanel";
import type { StepItem } from "../_components/bookshelf/StepGuide";

export const BOOKSHELF_STEPS: StepItem[] = [
  { step: "ステップ1", title: "棚を作成", description: "空の本棚を作り、置く場所を用意します。" },
  { step: "ステップ2", title: "本をドラッグ", description: "収集プールの本を、棚へドラッグして配置します。" },
  { step: "ステップ3", title: "並びを調整", description: "棚の中で本を動かし、自分の分類に整えます。" },
];

export const OPERATION_RULES: RuleItem[] = [
  { title: "ドラッグ", description: "収集プールの本を、棚の上へドラッグして配置します。" },
  { title: "代替操作", description: "本を選んで「本棚に追加」を押しても配置できます。" },
  { title: "取り外し", description: "棚から外しても本は削除されず、「未配置」に戻ります。" },
];

export const BOOKSHELF_NOTES: string[] = [
  "本棚の配置は、コレクション・タグとは別の整理です。棚を並べ替えても、コレクションの内容は変わりません。",
  "収集プールには、スキャンして保存した本が並びます。店頭価格を入れていない本は、お宝度を「—」と表示しています。",
];