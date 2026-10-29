// src/app/(dashboard)/_components/layout/Header.tsx
import { Search } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-neutral-300 bg-white px-8">
      <label className="relative block w-[26rem]">
        <span className="sr-only">本・著者・コレクションを検索</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
          aria-hidden
        />
        <input
          type="search"
          placeholder="本・著者・コレクションを検索"
          className="h-9 w-full rounded-sm border border-neutral-300 bg-neutral-50 pl-9 pr-3 text-sm placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
        />
      </label>

      <div className="flex items-center gap-6 text-sm font-medium">
        <button type="button" className="hover:text-neutral-600">通知</button>
        <button type="button" className="hover:text-neutral-600">マイアカウント</button>
      </div>
    </header>
  );
}