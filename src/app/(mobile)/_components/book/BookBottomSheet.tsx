'use client';

import React, { useState, useRef } from 'react';
import {
  BookOpen,
  X,
  Sparkles,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Bookmark,
  ShoppingCart,
  PenLine,
} from 'lucide-react';
import type { BookItem, FlagType, SheetState } from '../../_data/types';
import { PriceInputSection } from './PriceInputSection';
import { FlagDropdown } from './FlagDropdown';
import { ReviewCard } from './ReviewCard';

interface BookBottomSheetProps {
  sheetState: SheetState;
  selectedBook: BookItem | null;
  onClose: () => void;
  onSetSheetState: (state: SheetState | ((prev: SheetState) => SheetState)) => void;
  onEvaluate: (price: number) => void;
  onSetFlag: (flag: FlagType) => void;
}

export function BookBottomSheet({
  sheetState,
  selectedBook,
  onClose,
  onSetSheetState,
  onEvaluate,
  onSetFlag,
}: BookBottomSheetProps) {
  const [isInputtingPrice, setIsInputtingPrice] = useState(false);
  const [priceInputValue, setPriceInputValue] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);

  // ドラッグ操作用
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
    isDragging.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    const diff = dragStartY.current - e.clientY;
    if (Math.abs(diff) > 5) {
      isDragging.current = true;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    const diffY = dragStartY.current - e.clientY;

    if (!isDragging.current) {
      onSetSheetState((prev) => (prev === 'half' ? 'full' : 'half'));
    } else {
      if (diffY > 60) {
        onSetSheetState('full');
      } else if (diffY < -60) {
        onSetSheetState((prev) => (prev === 'full' ? 'half' : 'closed'));
      }
    }

    dragStartY.current = null;
    isDragging.current = false;
  };

  const handleExecuteEvaluation = (price: number) => {
    onEvaluate(price);
    setIsInputtingPrice(false);
    setPriceInputValue('');
    setJustEvaluated(true);

    setTimeout(() => {
      setJustEvaluated(false);
    }, 3000);
  };

  return (
    <>
      {/* 背景オーバーレイ */}
      {sheetState !== 'closed' && (
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/40 z-40 transition-opacity duration-300 ease-out cursor-pointer"
        />
      )}

      {/* シート本体 */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl border-t border-gray-200 flex flex-col transition-all duration-300 ease-out ${
          sheetState === 'closed'
            ? 'translate-y-full pointer-events-none invisible h-[64%]'
            : sheetState === 'full'
            ? 'translate-y-0 pointer-events-auto visible h-[92%]'
            : isInputtingPrice
            ? 'translate-y-0 pointer-events-auto visible h-[84%]'
            : 'translate-y-0 pointer-events-auto visible h-[64%]'
        }`}
      >
        {/* つまみバー */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing touch-none select-none shrink-0"
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* ヘッダー */}
        <div className="px-5 py-2 flex items-center justify-between shrink-0">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">本詳細</h2>

          <div className="flex items-center gap-1.5">
            {/* フラグメニュー */}
            <FlagDropdown
              currentFlag={selectedBook?.flag}
              onSelectFlag={onSetFlag}
            />

            {/* 展開/縮小ボタン */}
            <button
              type="button"
              onClick={() =>
                onSetSheetState((prev) => (prev === 'half' ? 'full' : 'half'))
              }
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
              title={sheetState === 'half' ? '全画面表示' : '半画面表示'}
            >
              {sheetState === 'half' ? (
                <ChevronUp className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <ChevronDown className="w-5 h-5 stroke-[2.2]" />
              )}
            </button>

            {/* 閉じるボタン */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
              title="閉じる"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {selectedBook && (
          <>
            {/* スクロールコンテンツ */}
            <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-3">
              {/* 書影 & タイトル & 著者 */}
              <div className="flex gap-4 items-start">
                <div className="w-16 h-20 bg-[#F0F1F2] rounded-2xl flex flex-col items-center justify-center text-gray-400 shrink-0">
                  <BookOpen className="w-6 h-6 stroke-[1.5] mb-1 text-gray-400" />
                  <span className="text-[10px] text-gray-400 font-medium">書影</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 leading-snug">
                    {selectedBook.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1.5 font-normal">
                    {selectedBook.author}
                  </p>
                </div>
              </div>

              {/* 発売日 & 出版社 */}
              <div className="mt-4 space-y-1.5 text-xs">
                <div className="flex items-center">
                  <span className="w-16 text-gray-400 shrink-0 font-normal">発売日</span>
                  <span className="text-gray-900 font-medium">
                    {selectedBook.publishedDate || selectedBook.publishedYear}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-16 text-gray-400 shrink-0 font-normal">出版社</span>
                  <span className="text-gray-900 font-medium">
                    {selectedBook.publisher || '白水社'}
                  </span>
                </div>
              </div>

              {/* 判定完了バナー */}
              {justEvaluated && (
                <div className="mt-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-between shadow-md animate-pulse">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-200" />
                    <span>お宝判定完了！ RANK {selectedBook.rank} 獲得 🎉</span>
                  </div>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-black">
                    {Math.round(
                      (1 - selectedBook.shopPrice / selectedBook.originalPrice) * 100,
                    )}
                    % OFF
                  </span>
                </div>
              )}

              {/* 価格行 */}
              <div className="mt-3.5 flex items-center justify-between">
                {selectedBook.isEvaluated ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-rose-600">
                        ¥{selectedBook.shopPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        定価 ¥{selectedBook.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded">
                        {Math.round(
                          (1 - selectedBook.shopPrice / selectedBook.originalPrice) * 100,
                        )}
                        % OFF
                      </span>
                    </div>
                    <span
                      className={`text-white text-[11px] font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs ${
                        selectedBook.rank === 'S'
                          ? 'bg-amber-500'
                          : selectedBook.rank === 'A'
                          ? 'bg-indigo-500'
                          : 'bg-gray-600'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" /> RANK {selectedBook.rank}
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
                      定価 ¥{selectedBook.originalPrice.toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* ネットの評判カード */}
              <ReviewCard
                rating={selectedBook.reviewRating}
                count={selectedBook.reviewCount}
                source={selectedBook.reviewSource}
                snippet={selectedBook.reviewSnippet}
              />

              {/* 全画面表示時に展開される詳細 */}
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  sheetState === 'full'
                    ? 'max-h-[500px] opacity-100 mt-5 space-y-4'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-700 mb-1">あらすじ・概要</h4>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {selectedBook.description}
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
                      <span className="font-bold text-gray-800">
                        {selectedBook.storeName}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-150">
                      <span className="text-gray-400 block text-[10px]">ISBNコード</span>
                      <span className="font-bold text-gray-800">{selectedBook.isbn}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-150">
                      <span className="text-gray-400 block text-[10px]">状態</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 帯付き・美品
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-150">
                      <span className="text-gray-400 block text-[10px]">スキャン日時</span>
                      <span className="font-bold text-gray-800">
                        {selectedBook.scanDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 下部固定エリア（価格入力 ⇔ ボタン切り替え） */}
            <div className="px-5 pt-2.5 pb-2 bg-white border-t border-gray-100 shrink-0">
              {isInputtingPrice ? (
                <PriceInputSection
                  originalPrice={selectedBook.originalPrice}
                  value={priceInputValue}
                  onChange={setPriceInputValue}
                  onCancel={() => setIsInputtingPrice(false)}
                  onEvaluate={handleExecuteEvaluation}
                />
              ) : (
                <div>
                  {selectedBook.isEvaluated ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSetFlag('purchased');
                            onClose();
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
                            setPriceInputValue(String(selectedBook.shopPrice || ''));
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
                        上にスワイプして、評判の続きを確認
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* ホームインジケーター */}
              <div className="hidden md:block w-28 h-1 bg-black rounded-full mx-auto mt-2 mb-0.5" />
            </div>
          </>
        )}
      </div>
    </>
  );
}
