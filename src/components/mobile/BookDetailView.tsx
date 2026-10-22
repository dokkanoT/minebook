'use client';

import React, { useState } from 'react';
import { BookOpen, Sparkles, CheckCircle2, Bookmark, ShoppingCart, Clock, Ban, Star, Quote, PenLine } from 'lucide-react';
import type { BookItem, FlagType } from './MobileScreen';

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

  // パターン1: インライン価格入力・お宝判定の状態管理
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
        {/* 書影 & タイトル & 著者 */}
        <div className="flex gap-4 items-start">
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
        {currentBook.reviewRating && (
          <div className="mt-4 bg-[#FEF8EF] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900">
                ネットの評判
              </h4>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-none stroke-[2]" />
                <span className="text-base font-black text-gray-900">
                  {currentBook.reviewRating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400 font-normal">
                  ({currentBook.reviewCount?.toLocaleString()}件)
                </span>
              </div>
            </div>

            <p className="text-xs text-[#9A6218] font-medium mt-1">
              {currentBook.reviewSource || 'Amazon / 読書メーター'}
            </p>

            {currentBook.reviewSnippet && (
              <div className="mt-3 bg-white rounded-xl p-3 shadow-2xs flex items-start gap-2.5">
                <Quote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-800 leading-relaxed font-normal">
                  {currentBook.reviewSnippet}
                </p>
              </div>
            )}
          </div>
        )}

        {/* あらすじ・概要 */}
        <div className="mt-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-1">あらすじ・概要</h4>
            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
              {currentBook.description}
            </p>
          </div>

          <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/50">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2">
              <Bookmark className="w-4 h-4 text-amber-600" />
              発掘データ詳細
            </h4>
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

      {/* 下部固定エリア（パターン1: インライン入力 ⇔ 通常ボタンスムーズ切り替え） */}
      <div className="px-5 pt-2.5 pb-2 bg-white border-t border-gray-100 shrink-0">
        {isInputtingPrice ? (
          <div className="space-y-2.5 animate-slide-down">
            {/* 上段：タイトル & キャンセル */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <PenLine className="w-3.5 h-3.5 text-[#9E6219]" />
                古本屋の店頭価格（税込）
              </span>
              <button
                type="button"
                onClick={() => setIsInputtingPrice(false)}
                className="text-xs text-gray-400 hover:text-gray-700 font-medium px-1.5 py-0.5 cursor-pointer"
              >
                キャンセル
              </button>
            </div>

            {/* 定番クイック選択ボタン（横スクロール） */}
            <div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                {[
                  { label: '¥110', val: 110 },
                  { label: '¥220', val: 220 },
                  { label: '¥330', val: 330 },
                  { label: '¥440', val: 440 },
                  { label: '¥550', val: 550 },
                  {
                    label: `半額 ¥${Math.round(currentBook.originalPrice / 2).toLocaleString()}`,
                    val: Math.round(currentBook.originalPrice / 2),
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setPriceInputValue(String(item.val))}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all active:scale-95 border cursor-pointer ${
                      priceInputValue === String(item.val)
                        ? 'bg-[#9E6219] text-white border-[#9E6219] shadow-xs'
                        : 'bg-[#FEF8F0] hover:bg-amber-100/70 text-[#9E6219] border-amber-200/80'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 金額入力ボックス ＋ お宝判定ボタン */}
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                  ¥
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={priceInputValue}
                  onChange={(e) => setPriceInputValue(e.target.value)}
                  placeholder="金額を入力"
                  autoFocus
                  className="w-full bg-gray-50 border-2 border-gray-250 focus:border-[#9E6219] focus:bg-white rounded-xl py-2 pl-7 pr-7 text-base font-bold text-gray-900 outline-none transition-all"
                />
                {priceInputValue && (
                  <button
                    type="button"
                    onClick={() => setPriceInputValue('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 text-[10px] flex items-center justify-center cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  const num = parseInt(priceInputValue, 10);
                  if (!isNaN(num) && num >= 0) {
                    handleExecuteEvaluation(num);
                  }
                }}
                disabled={!priceInputValue || isNaN(parseInt(priceInputValue, 10))}
                className="px-5 py-2.5 bg-[#9E6219] disabled:bg-gray-200 disabled:text-gray-400 hover:bg-[#8A5414] active:scale-95 text-white font-bold text-sm rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                判定する！
              </button>
            </div>

            {/* リアルタイムお宝度プレビュー */}
            {priceInputValue && !isNaN(parseInt(priceInputValue, 10)) && (
              <div className="text-center text-xs font-bold py-1.5 px-2 rounded-lg bg-[#FEF8F0] text-[#9E6219] border border-amber-200/80 flex items-center justify-center gap-2">
                {parseInt(priceInputValue, 10) < currentBook.originalPrice ? (
                  <>
                    <span>
                      {Math.round((1 - parseInt(priceInputValue, 10) / currentBook.originalPrice) * 100)}% OFF
                    </span>
                    <span>・</span>
                    <span>
                      お得額: +¥{(currentBook.originalPrice - parseInt(priceInputValue, 10)).toLocaleString()}
                    </span>
                    <span className={`text-[10px] text-white px-1.5 py-0.2 rounded font-black ${
                      (currentBook.originalPrice - parseInt(priceInputValue, 10)) / currentBook.originalPrice >= 0.75
                        ? 'bg-amber-500'
                        : 'bg-indigo-500'
                    }`}>
                      {(currentBook.originalPrice - parseInt(priceInputValue, 10)) / currentBook.originalPrice >= 0.75
                        ? 'RANK S'
                        : 'RANK A'}
                    </span>
                  </>
                ) : (
                  <span>定価以上（プレミア価格）</span>
                )}
              </div>
            )}
          </div>
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
                <p className="text-[11px] text-gray-400 text-center mt-2 font-normal">
                  上にスクロールして、評判の続きを確認
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
