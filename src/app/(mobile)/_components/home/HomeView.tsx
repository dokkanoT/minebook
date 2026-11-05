'use client';

import React from 'react';
import { BookOpen, ChevronRight, Clock, ShoppingCart, Ban } from 'lucide-react';
import type { BookItem, FlagType } from '../../_data/types';

interface HomeViewProps {
  books: BookItem[];
  onBookClick: (book: BookItem) => void;
  onStartScan: () => void;
}

export function HomeView({ books, onBookClick, onStartScan }: HomeViewProps) {
  const renderFlagBadge = (flag?: FlagType) => {
    switch (flag) {
      case 'purchased':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
            <ShoppingCart className="w-3 h-3" /> 購入済
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
            <Clock className="w-3 h-3" /> 保留中
          </span>
        );
      case 'skip':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-150 px-2 py-0.5 rounded-full border border-gray-300">
            <Ban className="w-3 h-3" /> 見送り
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      {/* ヘッダー */}
      <header className="px-5 py-4 border-b border-gray-200 flex items-center gap-2.5 bg-white shrink-0">
        <BookOpen className="w-6 h-6 stroke-[2.2]" />
        <h1 className="text-xl font-bold tracking-tight">MineBook</h1>
      </header>

      <div className="p-5 flex-1 flex flex-col min-h-0">
        {/* キャッチコピー */}
        <section className="mt-1 shrink-0">
          <h2 className="text-2xl font-bold leading-snug">
            気になる一冊を、<br />
            あなたの本棚へ。
          </h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            裏表紙のISBNをスキャンして、<br />
            店頭での発見を残しましょう。
          </p>
        </section>

        <hr className="my-5 border-gray-200 shrink-0" />

        {/* 最近保存した本リスト */}
        <section className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h3 className="font-bold text-base flex items-center gap-1.5">
              最近保存した本
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                {books.length}
              </span>
            </h3>
            <span className="text-[11px] text-gray-400">タップで詳細</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1 pb-1">
            {books.map((book) => (
              <button
                key={book.id}
                type="button"
                onClick={() => onBookClick(book)}
                className="w-full text-left border border-gray-250 rounded-xl p-3 bg-gray-50/60 hover:bg-gray-100/60 active:bg-gray-150 cursor-pointer active:scale-[0.99] transition-all flex items-center gap-3.5 shadow-sm touch-manipulation"
              >
                <div className="w-12 h-16 bg-gray-200/90 border border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 shrink-0">
                  <BookOpen className="w-4 h-4 stroke-1 mb-0.5" />
                  <span className="text-[9px]">書影</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-gray-900 truncate">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    {book.author}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-400">
                      {book.scanDate}
                    </span>
                    {!book.isEvaluated && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        <Clock className="w-2.5 h-2.5 text-amber-600" /> 未評価
                      </span>
                    )}
                    {renderFlagBadge(book.flag)}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* スキャン開始ボタン */}
        <div className="pt-6 pb-2 text-center mt-auto">
          <p className="text-xs text-gray-400 mb-2">本を見つけたら、ここから</p>
          <button
            type="button"
            onClick={onStartScan}
            className="w-full bg-neutral-800 hover:bg-neutral-900 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md cursor-pointer"
          >
            スキャンを開始する
          </button>
        </div>
      </div>
    </div>
  );
}
