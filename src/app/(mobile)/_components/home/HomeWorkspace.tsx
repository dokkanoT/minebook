'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HomeView } from './HomeView';
import { BookBottomSheet } from '../book/BookBottomSheet';
import { evaluateBookPrice } from '../../_data/bookEvaluation';
import type { BookItem, FlagType, SheetState } from '../../_data/types';

interface HomeWorkspaceProps {
  initialBooks: BookItem[];
}

/**
 * ホーム画面の端末側インタラクション（書籍選択・ボトムシート・価格評価・フラグ更新）を管理するクライアント部品
 */
export function HomeWorkspace({ initialBooks }: HomeWorkspaceProps) {
  const router = useRouter();
  const [books, setBooks] = useState<BookItem[]>(initialBooks);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(
    initialBooks[0] ?? null,
  );
  const [sheetState, setSheetState] = useState<SheetState>('closed');

  const handleBookClick = (book: BookItem) => {
    setSelectedBook(book);
    setSheetState('half');
  };

  const handleExecuteEvaluation = (price: number) => {
    if (!selectedBook) return;

    const { rank } = evaluateBookPrice(selectedBook.originalPrice, price);

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
