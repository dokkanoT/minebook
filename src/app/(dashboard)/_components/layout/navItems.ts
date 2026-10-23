// src/app/(dashboard)/_components/layout/navItems.ts
export const NAV_ITEMS = [
  { label: "ダッシュボード", href: "/dashboard" },
  { label: "本棚", href: "/bookshelf" },
  { label: "コレクション", href: "/collection" },
  { label: "ランキング", href: "/ranking" },
  { label: "発見履歴", href: "/history" },
  { label: "関心分析", href: "/analysis" },
  { label: "設定", href: "/settings" },
] as const;