'use client';

import React, { useState } from 'react';
import {
  ScanScreen,
  DEFAULT_SCANNED_LIST,
  type ScannedItem,
} from '../_components/scan/ScanScreen';
import { lookupBook } from '@/features/books/actions';
import { BookBottomSheet } from '../_components/book/BookBottomSheet';
import { INITIAL_BOOKS } from '../_data/mockData';
import type { BookItem, FlagType, SheetState } from '../_data/types';

export default function MobileScanPage() {
  const [scannedList, setScannedList] =
    useState<ScannedItem[]>(DEFAULT_SCANNED_LIST);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [sheetState, setSheetState] = useState<SheetState>('closed');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [booksById, setBooksById] = useState<Record<string, BookItem>>({});

  const handleSearchIsbn = async (isbn: string) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const result = await lookupBook(isbn);

      if (!result.ok) {
        if (result.error === 'invalid_isbn') {
          setSearchError('ISBN形式が正しくありません。(10桁または13桁の数字)');
        } else if (result.error === 'not_found') {
          setSearchError('該当する書籍が見つかりませんでした。');
        } else {
          setSearchError('書籍情報の取得に失敗しました。');
        }
        return;
      }

      const dbBook = result.book;
      const itemId = `book-${dbBook.isbn}-${Date.now()}`;

      const newBookItem: BookItem = {
        id: itemId,
        title: dbBook.title,
        author: dbBook.author ?? '不明',
        coverUrl: dbBook.cover_url ?? undefined,
        scanDate: new Date().toLocaleDateString('ja-JP'),
        categoryTag: dbBook.category ?? undefined,
        originalPrice: dbBook.list_price ?? 0,
        shopPrice: 0,
        storeName: '古本屋',
        isbn: dbBook.isbn,
        publishedYear: '',
        publisher: dbBook.publisher ?? '不明',
        description: dbBook.description ?? 'あらすじ情報はありません。',
        flag: 'none',
      };

      setBooksById((prev) => ({ ...prev, [itemId]: newBookItem }));
      setScannedList((prev) => [
        {
          id: itemId,
          title: dbBook.title,
          statusText: '未評価・価格未入力',
          isEvaluated: false,
          isNew: true,
        },
        ...prev.map((b) => ({ ...b, isNew: false })),
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenEvaluation = (item: ScannedItem) => {
    // 該当するモック書籍を特定（なければ先頭のモックデータをベースに生成）
    const matchedBook =
      booksById[item.id] ||
      INITIAL_BOOKS.find((b) => b.title === item.title) ||
      INITIAL_BOOKS.find(
        (b) => b.title.includes(item.title) || item.title.includes(b.title),
      ) ||
      (item.isEvaluated === false
        ? INITIAL_BOOKS.find((b) => !b.isEvaluated)
        : undefined) || {
        ...INITIAL_BOOKS[0],
        id: item.id,
        title: item.title,
        isEvaluated: item.isEvaluated,
        rank: item.rank,
      };

    setSelectedBook(matchedBook);
    setSheetState('half');
  };

  const handleExecuteEvaluation = (price: number) => {
    if (!selectedBook) return;

    const original = selectedBook.originalPrice;
    const discountRate = original > 0 ? (original - price) / original : 0;
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
    setBooksById((prev) => ({ ...prev, [selectedBook.id]: updatedBook }));

    // 読取リスト側のステータスも更新
    setScannedList((prev) =>
      prev.map((item) =>
        item.id === selectedBook.id ||
          item.title.includes(selectedBook.title) ||
          selectedBook.title.includes(item.title)
          ? {
            ...item,
            isEvaluated: true,
            rank,
            statusText: `評価済・¥${price.toLocaleString()}・${rank}`,
          }
          : item,
      ),
    );
  };

  const handleSetFlag = (flag: FlagType) => {
    if (!selectedBook) return;
    const updatedBook = { ...selectedBook, flag };
    setSelectedBook(updatedBook);
    setBooksById((prev) => ({ ...prev, [selectedBook.id]: updatedBook }));

  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      <ScanScreen
        scannedList={scannedList}
        onScannedListChange={setScannedList}
        onOpenEvaluation={handleOpenEvaluation}
        onSearchIsbn={handleSearchIsbn}
        isSearching={isSearching}
        searchError={searchError}
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
