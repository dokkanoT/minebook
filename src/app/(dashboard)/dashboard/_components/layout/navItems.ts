// src/app/(dashboard)/dashboard/_components/layout/navItems.ts
export const NAV_ITEMS = [
  { label: "ダッシュボード", href: "/dashboard" },
  { label: "本棚", href: "/dashboard/bookshelf" },
  { label: "コレクション", href: "/dashboard/collection" },
  { label: "ランキング", href: "/dashboard/ranking" },
  { label: "発見履歴", href: "/dashboard/history" },
  { label: "関心分析", href: "/dashboard/analysis" },
  { label: "設定", href: "/settings" },
] as const;