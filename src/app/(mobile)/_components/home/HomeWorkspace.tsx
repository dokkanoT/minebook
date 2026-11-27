'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HomeView } from './HomeView';
import { updateCollectionItem } from '@/features/collection/actions';
import { BookBottomSheet } from '../book/BookBottomSheet';
import { evaluateBookPrice } from '../../_data/bookEvaluation';
import type { BookItem, FlagType, SheetState } from '../../_data/types';

// Server Action がログイン切れで投げるリダイレクトは、握りつぶさずに Next.js に任せる
function isNextRedirectError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'digest' in err &&
    typeof err.digest === 'string' &&
    err.digest.startsWith('NEXT_REDIRECT')
  );
}

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
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleBookClick = (book: BookItem) => {
    setSaveError(null);
    setSelectedBook(book);
    setSheetState('half');
  };

  // 画面は先に書き換え、DB への保存は裏で行う（失敗したらシートにエラーを出す）
  const saveToCollection = (
    book: BookItem,
    updates: { storePrice?: number; status?: FlagType },
  ) => {
    if (book.isMock || !book.collectionItemId) return;

    updateCollectionItem({
      id: book.collectionItemId,
      storePrice: updates.storePrice,
      status:
        updates.status === undefined
          ? undefined
          : updates.status === 'none'
            ? null
            : updates.status,
    })
      .then((res) => setSaveError(res.ok ? null : res.error))
      .catch((err) => {
        if (isNextRedirectError(err)) throw err;
        setSaveError('DBへの保存中にエラーが発生しました。');
      });
  };

  const handleExecuteEvaluation = (price: number) => {
    if (!selectedBook) return;

    const { rank } = evaluateBookPrice(selectedBook, price);

    const updatedBook: BookItem = {
      ...selectedBook,
      isEvaluated: true,
      shopPrice: price,
      rank,
    };

    setSelectedBook(updatedBook);
    setBooks((prev) => prev.map((b) => (b.id === selectedBook.id ? updatedBook : b)));
    saveToCollection(updatedBook, { storePrice: price });
  };

  const handleSetFlag = (flag: FlagType) => {
    if (!selectedBook) return;
    const updatedBook = { ...selectedBook, flag };
    setSelectedBook(updatedBook);
    setBooks((prev) => prev.map((b) => (b.id === selectedBook.id ? updatedBook : b)));
    saveToCollection(updatedBook, { status: flag });
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
        saveError={saveError}
        onClose={() => setSheetState('closed')}
        onSetSheetState={setSheetState}
        onEvaluate={handleExecuteEvaluation}
        onSetFlag={handleSetFlag}
      />
    </div>
  );
}
