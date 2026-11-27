// src/app/(dashboard)/layout.tsx
import type { ReactNode } from "react";
import { Header } from "./dashboard/_components/layout/Header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 antialiased">
      <Header />
      <main className="px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mx-auto w-full max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
