// src/app/(dashboard)/_components/collection/CollectionToolbar.tsx
import { Plus } from "lucide-react";

export function CollectionToolbar({ count }: { count: number }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="text-sm font-bold">{count}件のコレクション</p>
      <button
        type="button"
        className="inline-flex h-10 items-center gap-1.5 rounded-sm bg-neutral-900 px-5 text-sm font-bold text-white transition-colors hover:bg-neutral-700"
      >
        <Plus className="h-4 w-4" aria-hidden />
        コレクション作成
      </button>
    </div>
  );
}