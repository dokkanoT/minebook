'use client';

import React, { useState } from 'react';
import type { BookItem, FlagType, SheetState, TabType } from '../_data/types';
import { INITIAL_BOOKS } from '../_data/mockData';
import { ScanScreen } from './scan/ScanScreen';
import { HomeView } from './home/HomeView';
import { BottomNav } from './layout/BottomNav';
import { BookBottomSheet } from './book/BookBottomSheet';

// 型を外部から import しているファイル（BookDetailView など）との互換性を維持
export type { BookItem, FlagType, SheetState, TabType };

export function MobileScreen() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [books, setBooks] = useState<BookItem[]>(INITIAL_BOOKS);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(INITIAL_BOOKS[0]);
  const [sheetState, setSheetState] = useState<SheetState>('closed');

  // 本タップ時の処理（ボトムシートを開く）
  const handleBookClick = (book: BookItem) => {
    setSelectedBook(book);
    setSheetState('half');
  };

  // スキャン画面からの判定開始
  const handleOpenEvaluationFromScan = (item: { title: string; isEvaluated?: boolean }) => {
    const matchedBook =
      books.find((b) => b.title === item.title) ||
      books.find((b) => b.title.includes(item.title) || item.title.includes(b.title)) ||
      (item.isEvaluated === false ? books.find((b) => !b.isEvaluated) : undefined) ||
      books[0];

    setSelectedBook(matchedBook);
    setSheetState('half');
  };

  // お宝度判定の実行（割引率から RANK を決定）
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

  // ステータスフラグ（購入・保留・見送り）の設定
  const handleSetFlag = (flag: FlagType) => {
    if (!selectedBook) return;
    const updatedBook = { ...selectedBook, flag };
    setSelectedBook(updatedBook);
    setBooks((prev) => prev.map((b) => (b.id === selectedBook.id ? updatedBook : b)));
  };

  return (
    <div className="h-[100dvh] w-full bg-neutral-100 md:p-3 flex flex-col justify-center items-center overflow-hidden touch-manipulation">
      {/* 画面切り替えテストバー（PCブラウザ確認時のみ表示） */}
      <style>{`
        @keyframes tabFadeInCustom {
          0% {
            opacity: 0;
            transform: translateY(6px) scale(0.99);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-tab-change {
          animation: tabFadeInCustom 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        }
      `}</style>

      <div className="hidden md:flex mb-2 shrink-0 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200 items-center gap-2 text-xs">
        <span className="text-gray-400 font-bold text-[11px] mr-1">画面切り替え:</span>
        <button
          type="button"
          onClick={() => setCurrentTab('home')}
          className={`px-3 py-1 rounded-full font-bold transition-all ${
            currentTab === 'home'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          ホーム画面
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('scan')}
          className={`px-3 py-1 rounded-full font-bold transition-all ${
            currentTab === 'scan'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          ISBNスキャン画面
        </button>
      </div>

      {/* スマホ本体フレーム */}
      <div className="w-full max-w-[420px] h-full md:max-h-[min(844px,calc(100dvh-3.2rem))] bg-white text-gray-900 flex flex-col justify-between md:shadow-2xl md:rounded-[36px] overflow-hidden md:border border-gray-200 relative">
        {/* メイン画面エリア */}
        <div
          key={currentTab}
          className="flex-1 flex flex-col min-h-0 overflow-hidden animate-tab-change"
        >
          {currentTab === 'scan' ? (
            <ScanScreen
              onBack={() => setCurrentTab('home')}
              onOpenEvaluation={handleOpenEvaluationFromScan}
            />
          ) : (
            <HomeView
              books={books}
              onBookClick={handleBookClick}
              onStartScan={() => setCurrentTab('scan')}
            />
          )}
        </div>

        {/* 共通ボトムバー */}
        <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />

        {/* 共通詳細ボトムシート */}
        <BookBottomSheet
          sheetState={sheetState}
          selectedBook={selectedBook}
          onClose={() => setSheetState('closed')}
          onSetSheetState={setSheetState}
          onEvaluate={handleExecuteEvaluation}
          onSetFlag={handleSetFlag}
        />
      </div>
    </div>
  );
}
