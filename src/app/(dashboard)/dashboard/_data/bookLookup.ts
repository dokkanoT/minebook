// src/app/(dashboard)/_data/bookLookup.ts
import { MOCK_BOOKS, type MockBook } from "./books";

const BOOK_BY_ID = new Map(MOCK_BOOKS.map((book) => [book.id, book] as const));

export function pickBook(id: string): MockBook {
  const book = BOOK_BY_ID.get(id);
  if (!book) throw new Error(`Unknown mock book: ${id}`);
  return book;
}

export function pickBooks(ids: readonly string[]): MockBook[] {
  return ids.map(pickBook);
}