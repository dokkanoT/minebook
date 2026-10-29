'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HomeView } from '../_components/home/HomeView';
import { BookBottomSheet } from '../_components/book/BookBottomSheet';
import { INITIAL_BOOKS } from '../_data/mockData';
import type { BookItem, FlagType, SheetState } from '../_data/types';

export default function MobileHomePage() {
  const router = useRouter();
  const [books, setBooks] = useState<BookItem[]>(INITIAL_BOOKS);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(INITIAL_BOOKS[0]);
  const [sheetState, setSheetState] = useState<SheetState>('closed');

  const handleBookClick = (book: BookItem) => {
    setSelectedBook(book);
    setSheetState('half');
  };

  const handleExecuteEvaluation = (price: number) => {
    if (!selectedBook) return;

    const original = selectedBook.originalPrice;
    const discountRate = (original - price) / original;

    let rank: 'S' | 'A' | 'B' = 'B';
    if (discountRate >= 0.75) {
      rank = 'S';
    } else if (discountRate >= 0.5) {
      rank = 'A';
    } else {
      rank = 'B';
    }

    const updatedBook: BookItem = {
      ...selectedBook,
      isEvaluated: true,
      shopPrice: price,
      rank,
    };

    setSelectedBook(updatedBook);
    setBooks((prev) => prev.map((b) => (b.id === selectedBook.id ? updatedBook : b)));
  };

  const handleSetFlag = (flag: FlagType) => {
    if (!selectedBook) return;
    const updatedBook = { ...selectedBook, flag };
    setSelectedBook(updatedBook);
    setBooks((prev) => prev.map((b) => (b.id === selectedBook.id ? updatedBook : b)));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      <HomeView
        books={books}
        onBookClick={handleBookClick}
        onStartScan={() => router.push('/scan')}
      />

      <BookBottomSheet
        sheetState={sheetState}
        selectedBook={selectedBook}
        onClose={() => setSheetState('closed')}
        onSetSheetState={setSheetState}
        onEvaluate={handleExecuteEvaluation}
        onSetFlag={handleSetFlag}
      />
    </div>
  );
}
