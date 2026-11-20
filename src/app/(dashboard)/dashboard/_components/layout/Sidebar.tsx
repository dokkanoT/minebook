// src/app/(dashboard)/_components/layout/Sidebar.tsx
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { SidebarNav } from "./SidebarNav";

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-52 flex-col border-r border-neutral-300 bg-white">
      <Link href="/dashboard" className="flex h-14 items-center gap-2 px-5">
        <BookOpen className="h-5 w-5" aria-hidden />
        <span className="text-xl font-bold tracking-tight">MineBook</span>
      </Link>
      <div className="px-3 pt-4">
        <p className="mb-3 px-2 text-xs text-neutral-500">ライブラリ管理</p>
        <SidebarNav />
      </div>
    </aside>
  );
}