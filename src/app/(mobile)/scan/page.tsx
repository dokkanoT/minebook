'use client';

import React, { useState } from 'react';
import {
  ScanScreen,
  DEFAULT_SCANNED_LIST,
  type ScannedItem,
} from '../_components/scan/ScanScreen';
import { BookBottomSheet } from '../_components/book/BookBottomSheet';
import { INITIAL_BOOKS } from '../_data/mockData';
import type { BookItem, FlagType, SheetState } from '../_data/types';

export default function MobileScanPage() {
  const [scannedList, setScannedList] =
    useState<ScannedItem[]>(DEFAULT_SCANNED_LIST);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [sheetState, setSheetState] = useState<SheetState>('closed');

  const handleOpenEvaluation = (item: ScannedItem) => {
    // 該当するモック書籍を特定（なければ先頭のモックデータをベースに生成）
    const matchedBook =
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
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      <ScanScreen
        scannedList={scannedList}
        onScannedListChange={setScannedList}
        onOpenEvaluation={handleOpenEvaluation}
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
