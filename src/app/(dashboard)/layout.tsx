// src/app/(dashboard)/layout.tsx
import type { ReactNode } from "react";
import { Header } from "./dashboard/_components/layout/Header";
import { Sidebar } from "./dashboard/_components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    // PC向け画面がスマホで開かれても崩れないよう、最小幅を確保して横スクロールさせる
    <div className="min-h-screen min-w-[1024px] bg-neutral-100 text-neutral-900 antialiased">
      <Sidebar />
      {/* サイドバー幅 (w-52) ぶん左を空ける */}
      <div className="pl-52">
        <Header />
        <main className="px-8 py-7">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}