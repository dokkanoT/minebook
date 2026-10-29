// src/app/(dashboard)/_components/bookshelf/DropSlot.tsx
type DropSlotProps = {
  title: string;
  description: string;
  className?: string;
};

/** 点線のドロップ先表示 */
export function DropSlot({ title, description, className = "" }: DropSlotProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-neutral-400 bg-neutral-50 px-4 py-6 text-center ${className}`}
    >
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs text-neutral-600">{description}</p>
    </div>
  );
}