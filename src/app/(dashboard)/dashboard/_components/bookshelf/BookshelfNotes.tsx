// src/app/(dashboard)/_components/bookshelf/BookshelfNotes.tsx
export function BookshelfNotes({ notes }: { notes: string[] }) {
  return (
    <div className="mt-4 space-y-2">
      {notes.map((note) => (
        <p
          key={note}
          className="rounded-sm border border-neutral-300 bg-white px-4 py-3 text-xs text-neutral-600"
        >
          {note}
        </p>
      ))}
    </div>
  );
}