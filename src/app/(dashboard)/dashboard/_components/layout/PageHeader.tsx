// src/app/(dashboard)/_components/layout/PageHeader.tsx
type PageHeaderProps = {
  title: string;
  description: string;
  /** 右上の補足（例: 「対象：本棚に保存済みの本」） */
  meta?: string;
};

export function PageHeader({ title, description, meta }: PageHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-xs text-neutral-600">{description}</p>
      </div>
      {meta && <p className="pt-2 text-xs text-neutral-600">{meta}</p>}
    </div>
  );
}