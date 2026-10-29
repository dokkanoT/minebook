import type { ReactNode } from "react";

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <main className="h-[100dvh] w-full bg-neutral-100 flex flex-col justify-center items-center overflow-hidden touch-manipulation">
      <div className="w-full max-w-[420px] h-full bg-white text-gray-900 flex flex-col justify-between overflow-hidden relative md:shadow-2xl md:rounded-[36px] md:border border-gray-200">
        {children}
      </div>
    </main>
  );
}
