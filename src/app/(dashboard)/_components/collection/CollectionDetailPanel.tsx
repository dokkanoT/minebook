// src/app/(dashboard)/_components/collection/CollectionDetailPanel.tsx
import { BookCard } from "../shared/BookCard";
import { OutlineButton } from "../ui/OutlineButton";
import { Panel } from "../ui/Panel";
import type { CollectionView } from "./CollectionWorkspace";

export function CollectionDetailPanel({ collection }: { collection: CollectionView }) {
  const count = collection.books.length;

  return (
    <Panel
      title={collection.name}
      description={`登録${count}冊 / 全${count}冊を表示`}
      action={<OutlineButton size="sm">書籍を追加・整理</OutlineButton>}
    >
      {count === 0 ? (
        <p className="py-10 text-center text-xs text-neutral-500">
          このコレクションにはまだ本がありません。
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {collection.books.map((book) => (
            <BookCard
              key={book.id}
              title={book.title}
              author={book.author}
              category={book.category}
              score={book.score}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}