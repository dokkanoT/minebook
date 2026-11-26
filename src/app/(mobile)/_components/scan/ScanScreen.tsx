'use client';

import React, { useState } from 'react';
import { ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { BookCover } from '../book/BookCover';
import { DEFAULT_SCANNED_LIST } from '../../_data/mockData';
import type { ScannedItem } from '../../_data/types';
import { CameraPreview } from './CameraPreview';

export type { ScannedItem };
export { DEFAULT_SCANNED_LIST };

export interface ScanScreenProps {
  onBack?: () => void;
  onOpenEvaluation?: (item: ScannedItem) => void;
  scannedList?: ScannedItem[];
  onScannedListChange?: (list: ScannedItem[]) => void;
  onSearchIsbn?: (isbn: string) => Promise<boolean | void> | boolean | void;
  isSearching?: boolean;
  searchError?: string | null;
}

export const ScanScreen = ({
  onOpenEvaluation,
  scannedList: externalScannedList,
  onSearchIsbn,
  isSearching = false,
  searchError,
}: ScanScreenProps) => {
  const [isbnInput, setIsbnInput] = useState('');
  const [internalList] = useState<ScannedItem[]>(DEFAULT_SCANNED_LIST);

  const handleIsbnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = isbnInput.trim();
    if (!trimmed || !onSearchIsbn || isSearching) return;
    const succeeded = await onSearchIsbn(trimmed);
    if (succeeded !== false) {
      setIsbnInput('');
    }
  };

  const scannedList = externalScannedList ?? internalList;

  const unevaluatedCount = scannedList.filter((item) => !item.isEvaluated).length;

  // カメラで ISBN を読み取ったとき
  const handleDetectIsbn = (isbn: string) => {
    if (isSearching) return;
    navigator.vibrate?.(50); // 読み取れたことを手に伝える（Android のみ）

    void onSearchIsbn?.(isbn);
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-white text-gray-900 min-h-0">
      {/* ★ 確実にアニメーションを効かせるためのスタイル定義 */}
      <style>{`
        @keyframes slideInFromTopCustom {
          0% {
            opacity: 0;
            transform: translateY(-36px) scale(0.95);
          }
          60% {
            opacity: 0.9;
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .slide-down-active {
          animation: slideInFromTopCustom 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        }
      `}</style>

      {/* 上部エリア */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* ヘッダー（戻るボタンを廃止し、スッキリ中央配置） */}
        <header className="px-4 py-3.5 border-b border-gray-200 flex items-center justify-center bg-white shrink-0">
          <h1 className="text-base font-bold text-gray-900 tracking-tight">
            ISBNスキャン
          </h1>
        </header>

        <div className="p-5 flex-1 flex flex-col min-h-0">
          {/* 指示テキスト（一般の人が迷わない親切なガイド） */}
          <div className="text-center mt-1 mb-3">
            <h2 className="text-sm font-bold text-gray-900">
              裏表紙のバーコードを枠に合わせてください
            </h2>
            <p className="text-[11px] text-amber-800 font-semibold mt-1 bg-amber-50 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-200">
              <span>※ 2段あるうちの</span>
              <span className="underline decoration-amber-500 underline-offset-2 font-black">上段（978〜）</span>
              <span>を読み取ります</span>
            </p>
          </div>

          {/* カメラプレビュー領域 */}
          <div className="w-full bg-gray-200 border border-gray-300 rounded-xl p-3 relative overflow-hidden shadow-inner">
            <CameraPreview onDetect={handleDetectIsbn} busy={isSearching} />

            {/* 下部ステータス */}
            <p className="text-[11px] text-gray-500 mt-2 text-center">
              {isSearching ? (
                <span className="text-rose-600 font-bold animate-pulse">検索中...</span>
              ) : (
                '読み取り待ち…'
              )}
            </p>
          </div>

          {/* 案内テキスト */}
          <p className="text-xs text-gray-400 text-center mt-2.5">
            読み取れたら、自動で下部リストに追加されます。
          </p>

          {/* ISBN手入力フォーム&テストボタン */}
          <form onSubmit={handleIsbnSubmit} className="mt-3 flex gap-2">
            <input
              type="text"
              inputMode="search"
              value={isbnInput}
              onChange={(e) => setIsbnInput(e.target.value)}
              placeholder="ISBNを手入力"
              disabled={isSearching}
              className="flex-1 bg-gray-50 border border-gray-300 focus:border-[#9E6219] focus:bg-white rounded-xl px-3 py-2 text-xs font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isSearching || !isbnInput.trim()}
              className="bg-neutral-800 hover:bg-neutral-900 disabled:bg-gray-300 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              {isSearching ? '検索中...' : '検索'}
            </button>
          </form>
          {searchError && (
            <p role="alert" className="text-[11px] text-rose-600 font-medium mt-1.5 px-1">
              <span className="inline-block mr-1">⚠️</span>
              {searchError}
            </p>
          )}

          {/* テスト用ボタン */}
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-gray-400">※テスト用</span>
            <button
              type="button"
              disabled={isSearching}
              onClick={() => onSearchIsbn && onSearchIsbn('9784101010014')}
              className="text-[10px] bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
            >
              吾輩は猫である
            </button>
            <button
              type="button"
              disabled={isSearching}
              onClick={() => onSearchIsbn && onSearchIsbn('9784873115658')}
              className="text-[10px] bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
            >
              リーダブルコード
            </button>
          </div>

          {/* 読取済みリストセクション */}
          <div className="mt-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <h3 className="font-bold text-sm text-gray-900">
                読取済みリスト
              </h3>
              <span className="text-xs text-gray-500">
                {scannedList.length}冊 / 未評価{unevaluatedCount}冊
              </span>
            </div>

            {/* スクロール可能なリスト */}
            <div className="space-y-2 overflow-y-auto max-h-[220px] pr-0.5">
              {scannedList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenEvaluation && onOpenEvaluation(item)}
                  className={`w-full text-left border rounded-lg p-2.5 transition-all flex items-center gap-3 shadow-xs cursor-pointer active:scale-[0.99] touch-manipulation ${
                    item.isNew
                      ? 'slide-down-active bg-amber-50 border-amber-300 ring-2 ring-amber-300/50'
                      : 'bg-gray-50/50 border-gray-300 hover:bg-gray-100/60'
                  }`}
                >
                  <BookCover
                    coverUrl={item.coverUrl}
                    title={item.title}
                    size="sm"
                    highlighted={item.isNew}
                  />

                  {/* 書籍タイトルとステータス */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-gray-900 truncate">
                        {item.title}
                      </h4>
                      {item.isNew && (
                        <span className="text-[9px] font-black text-amber-700 bg-amber-200 px-1 py-0.5 rounded shrink-0">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5 truncate flex items-center gap-1">
                      {item.isEvaluated ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 inline shrink-0" />
                          <span className="text-emerald-700 font-medium truncate">
                            {item.statusText}
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-amber-600 inline shrink-0" />
                          <span className="truncate">{item.statusText}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* 矢印 */}
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 下部固定ボタン（ボトムナビゲーションバーの上にスッキリ配置） */}
      <div className="px-4 py-2.5 border-t border-gray-200 bg-white shrink-0">
        <button
          type="button"
          disabled={unevaluatedCount === 0}
          onClick={() => {
            if (unevaluatedCount > 0 && onOpenEvaluation) {
              const firstUnevaluated = scannedList.find((b) => !b.isEvaluated) || scannedList[0];
              onOpenEvaluation(firstUnevaluated);
            }
          }}
          className="w-full bg-neutral-800 hover:bg-neutral-900 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md text-sm cursor-pointer"
        >
          未評価の本を確認（{unevaluatedCount}冊）
        </button>
      </div>
    </div>
  );
};
