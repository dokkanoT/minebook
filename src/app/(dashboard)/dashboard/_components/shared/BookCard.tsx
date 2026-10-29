// src/app/(dashboard)/_components/shared/BookCard.tsx
type BookCardProps = {
  title: string;
  author: string;
  category: string;
  score: number;
};

export function BookCard({ title, author, category, score }: BookCardProps) {
  return (
    <article>
      <div className="flex aspect-[4/3] items-center justify-center bg-neutral-200">
        <div className="flex aspect-[2/3] h-4/5 items-center justify-center border border-neutral-300 bg-neutral-100 text-[10px] text-neutral-500">
          書影
        </div>
      </div>
      <h3 className="mt-3 text-sm font-bold">{title}</h3>
      <p className="mt-1 text-xs text-neutral-600">{author}</p>
      <p className="mt-1 flex items-center justify-between text-xs text-neutral-600">
        <span>{category}</span>
        <span className="font-bold text-neutral-900">お宝度 {score}</span>
      </p>
    </article>
  );
}