'use client';

import React, { useState } from 'react';
import { BookOpen, Sparkles, CheckCircle2, Bookmark, ShoppingCart, PenLine } from 'lucide-react';
import type { BookItem, FlagType } from '../../_data/types';
import { PriceInputSection } from './PriceInputSection';
import { FlagDropdown } from './FlagDropdown';
import { ReviewCard } from './ReviewCard';

interface BookDetailViewProps {
  isbn?: string;
  book?: BookItem;
  onClose?: () => void;
  onSave?: (book: BookItem) => void;
}

const SAMPLE_BOOK_MAP: Record<string, BookItem> = {
  '9784560027783': {
    id: 'book-unrated-1',
    title: '夜を読む ―失われた読書体験を求めて',
    author: 'アルベルト・マングェル',
    scanDate: 'たった今',
    categoryTag: '文学・エッセイ',
    originalPrice: 2420,
    shopPrice: 0,
    isEvaluated: false,
    storeName: 'ブックオフ 渋谷店',
    isbn: '9784560027783',
    publishedYear: '2013年',
    publishedDate: '2013年10月25日',
    publisher: '白水社',
    reviewRating: 4.4,
    reviewCount: 168,
    reviewSnippet: '読書という行為の深さと豊かさを優雅に説く。夜の静けさの中でページをめくりたくなる本好き必読の傑作。',
    reviewSource: 'Amazon / 読書メーター',
    description: '古今東西の書物と読書家たちの夜の思索。本を読むという行為の豊かさと深さを、優雅なエピソードで綴る世界的ベストセラー。',
    flag: 'none',
  },
  '9784873115658': {
    id: 'book-2',
    title: 'リーダブルコード ―より良いコードを書くための実践テクニック',
    author: 'Dustin Boswell, Trevor Foucher',
    scanDate: '昨日 17:45',
    categoryTag: '技術書',
    originalPrice: 2640,
    shopPrice: 220,
    rank: 'S',
    isEvaluated: true,
    storeName: '古書堂 神保町本店',
    isbn: '9784873115658',
    publishedYear: '2012年',
    publishedDate: '2012年6月6日',
    publisher: 'オライリー・ジャパン',
    reviewRating: 4.7,
    reviewCount: 1420,
    reviewSnippet: '新人からベテランまで全エンジニア必読。変数の名前付けから関数の分割まで、読みやすいコードの真髄が凝縮されている。',
    reviewSource: 'Amazon ★4.7',
    description: 'プログラマにとって最も重要な原則を平易に解説した世界的大ベストセラー。名前の付け方からループの簡潔化まで。',
    flag: 'purchased',
  },
};

export const BookDetailView = ({
  isbn,
  book: initialBook,
  onClose,
  onSave,
}: BookDetailViewProps) => {
  const defaultBook = (isbn && SAMPLE_BOOK_MAP[isbn]) || SAMPLE_BOOK_MAP['9784560027783'];
  const [currentBook, setCurrentBook] = useState<BookItem>(initialBook || defaultBook);

  const [isInputtingPrice, setIsInputtingPrice] = useState(false);
  const [priceInputValue, setPriceInputValue] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);

  // お宝度判定の実行
  const handleExecuteEvaluation = (price: number) => {
    const original = currentBook.originalPrice;
    const discountRate = (original - price) / original;

    let rank: 'S' | 'A' | 'B' = 'B';
    if (discountRate >= 0.75) {
      rank = 'S';
    } else if (discountRate >= 0.50) {
      rank = 'A';
    } else {
      rank = 'B';
    }

    const updated: BookItem = {
      ...currentBook,
      isEvaluated: true,
      shopPrice: price,
      rank,
    };

    setCurrentBook(updated);
    setIsInputtingPrice(false);
    setPriceInputValue('');
    setJustEvaluated(true);
    if (onSave) onSave(updated);

    setTimeout(() => {
      setJustEvaluated(false);
    }, 3000);
  };

  const handleSetFlag = (flag: FlagType) => {
    const updated = { ...currentBook, flag };
    setCurrentBook(updated);
    if (onSave) onSave(updated);
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-white text-gray-900 overflow-hidden">
      {/* スクロールコンテンツエリア */}
      <div className="flex-1 overflow-y-auto min-h-0 px-5 pt-4 pb-3">
        {/* 書影 & タイトル & 著者 ＋ フラグメニュー */}
        <div className="flex gap-4 items-start justify-between">
          <div className="flex gap-4 items-start flex-1 min-w-0">
            <div className="w-16 h-20 bg-[#F0F1F2] rounded-2xl flex flex-col items-center justify-center text-gray-400 shrink-0">
              <BookOpen className="w-6 h-6 stroke-[1.5] mb-1 text-gray-400" />
              <span className="text-[10px] text-gray-400 font-medium">書影</span>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 leading-snug">
                {currentBook.title}
              </h2>
              <p className="text-xs text-gray-400 mt-1.5 font-normal">
                {currentBook.author}
              </p>
            </div>
          </div>

          <FlagDropdown
            currentFlag={currentBook.flag}
            onSelectFlag={handleSetFlag}
          />
        </div>

        {/* 発売日 & 出版社（左揃えキーバリュー） */}
        <div className="mt-4 space-y-1.5 text-xs">
          <div className="flex items-center">
            <span className="w-16 text-gray-400 shrink-0 font-normal">発売日</span>
            <span className="text-gray-900 font-medium">
              {currentBook.publishedDate || currentBook.publishedYear}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-16 text-gray-400 shrink-0 font-normal">出版社</span>
            <span className="text-gray-900 font-medium">
              {currentBook.publisher || '白水社'}
            </span>
          </div>
        </div>

        {/* 判定完了直後のアニメーションバナー */}
        {justEvaluated && (
          <div className="mt-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-between shadow-md animate-pulse">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-200" />
              <span>お宝判定完了！ RANK {currentBook.rank} 獲得 🎉</span>
            </div>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-black">
              {Math.round((1 - currentBook.shopPrice / currentBook.originalPrice) * 100)}% OFF
            </span>
          </div>
        )}

        {/* 価格行 */}
        <div className="mt-3.5 flex items-center justify-between">
          {currentBook.isEvaluated ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-rose-600">
                  ¥{currentBook.shopPrice.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  定価 ¥{currentBook.originalPrice.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded">
                  {Math.round((1 - currentBook.shopPrice / currentBook.originalPrice) * 100)}% OFF
                </span>
              </div>
              <span className={`text-white text-[11px] font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs ${
                currentBook.rank === 'S'
                  ? 'bg-amber-500'
                  : currentBook.rank === 'A'
                  ? 'bg-indigo-500'
                  : 'bg-gray-600'
              }`}>
                <Sparkles className="w-3 h-3" /> RANK {currentBook.rank}
              </span>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsInputtingPrice(true);
                  setPriceInputValue('');
                }}
                className="bg-[#FEF5E7] hover:bg-[#FDF0D9] active:scale-95 text-[#9A6218] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-amber-300/80 transition-all cursor-pointer shadow-2xs"
                title="店頭価格を入力"
              >
                <PenLine className="w-3.5 h-3.5 text-[#9A6218]" />
                <span>店頭価格 未入力</span>
                <span className="text-[10px] bg-[#9A6218] text-white px-1.5 py-0.2 rounded font-normal">
                  入力する
                </span>
              </button>
              <span className="text-xs text-gray-400">
                定価 ¥{currentBook.originalPrice.toLocaleString()}
              </span>
            </>
          )}
        </div>

        {/* ネットの評判カード */}
        <ReviewCard
          rating={currentBook.reviewRating}
          count={currentBook.reviewCount}
          source={currentBook.reviewSource}
          snippet={currentBook.reviewSnippet}
        />

        {/* あらすじ・概要 */}
        <div className="mt-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-gray-700 mb-1">あらすじ・概要</h3>
            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
              {currentBook.description}
            </p>
          </div>

          <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/50">
            <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2">
              <Bookmark className="w-4 h-4 text-amber-600" />
              発掘データ詳細
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-gray-150">
                <span className="text-gray-400 block text-[10px]">発見店舗</span>
                <span className="font-bold text-gray-800">{currentBook.storeName}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-150">
                <span className="text-gray-400 block text-[10px]">ISBNコード</span>
                <span className="font-bold text-gray-800">{currentBook.isbn}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-150">
                <span className="text-gray-400 block text-[10px]">状態</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 帯付き・美品
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-150">
                <span className="text-gray-400 block text-[10px]">スキャン日時</span>
                <span className="font-bold text-gray-800">{currentBook.scanDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 下部固定エリア */}
      <div className="px-5 pt-2.5 pb-4 bg-white border-t border-gray-100 shrink-0">
        {isInputtingPrice ? (
          <PriceInputSection
            originalPrice={currentBook.originalPrice}
            value={priceInputValue}
            onChange={setPriceInputValue}
            onCancel={() => setIsInputtingPrice(false)}
            onEvaluate={handleExecuteEvaluation}
          />
        ) : (
          <div>
            {currentBook.isEvaluated ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleSetFlag('purchased');
                      if (onClose) onClose();
                    }}
                    className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-emerald-400" />
                    購入済にして保存
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsInputtingPrice(true);
                      setPriceInputValue(String(currentBook.shopPrice || ''));
                    }}
                    className="px-4 py-3 bg-[#FEF5E7] hover:bg-amber-100/70 text-[#9E6219] font-bold text-xs rounded-xl border border-amber-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    再判定
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsInputtingPrice(true);
                    setPriceInputValue('');
                  }}
                  className="w-full py-3.5 bg-[#9E6219] hover:bg-[#8A5414] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PenLine className="w-4 h-4 stroke-[2.2]" />
                  店頭価格を入力
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
