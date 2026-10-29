// src/app/(dashboard)/_components/ui/BookThumb.tsx

/** 表の中で使う小さな書影プレースホルダー */
export function BookThumb() {
  return (
    <div
      aria-hidden
      className="flex h-11 w-8 items-center justify-center border border-neutral-300 bg-neutral-200 text-[9px] text-neutral-500"
    >
      書影
    </div>
  );
}