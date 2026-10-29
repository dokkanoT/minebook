// src/app/(dashboard)/dashboard/_components/dashboard/RecentBooksPanel.tsx
import { BookCard } from "../shared/BookCard";
import { ArrowLink } from "../ui/ArrowLink";
import { Panel } from "../ui/Panel";

type RecentBook = {
  id: string;
  title: string;
  author: string;
  category: string;
  score: number;
};

export function RecentBooksPanel({ books }: { books: RecentBook[] }) {
  return (
    <Panel
      title="最近保存した本"
      description={`最近の${books.length}冊だけを表示。全冊の検索・閲覧は「本棚」へ。`}
      action={<ArrowLink href="/dashboard/bookshelf">本棚を開く</ArrowLink>}
    >
      <div className="grid grid-cols-5 gap-4">
        {books.map((book) => (
          <BookCard
            key={book.id}
            title={book.title}
            author={book.author}
            category={book.category}
            score={book.score}
          />
        ))}
      </div>
    </Panel>
  );
}