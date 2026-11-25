'use client';

import React, { useState } from 'react';
import { ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { CameraPreview } from './CameraPreview';

export interface ScannedItem {
  id: string;
  title: string;
  statusText: string;
  isEvaluated: boolean;
  rank?: 'S' | 'A' | 'B';
  isNew?: boolean;
}

export interface ScanScreenProps {
  onBack?: () => void;
  onOpenEvaluation?: (item: ScannedItem) => void;
  scannedList?: ScannedItem[];
  onScannedListChange?: (list: ScannedItem[]) => void;
  onSearchIsbn?: (isbn: string) => Promise<boolean | void> | boolean | void;
  isSearching?: boolean;
}

export const DEFAULT_SCANNED_LIST: ScannedItem[] = [
  {
    id: 'scanned-1',
    title: '古書のある風景',
    statusText: '未評価・店頭価格未入力',
    isEvaluated: false,
  },
  {
    id: 'scanned-2',
    title: '夜を読む',
    statusText: '未評価・店頭価格未入力',
    isEvaluated: false,
  },
  {
    id: 'scanned-3',
    title: '小さな物語',
    statusText: '評価済・未保存・A（表示例）',
    isEvaluated: true,
    rank: 'A',
  },
];

export const ScanScreen = ({
  onOpenEvaluation,
  scannedList: externalScannedList,
  onScannedListChange,
  onSearchIsbn,
  isSearching = false,
}: ScanScreenProps) => {
  const [internalList, setInternalList] = useState<ScannedItem[]>(DEFAULT_SCANNED_LIST);

  const scannedList = externalScannedList ?? internalList;
  const updateScannedList = (updater: (prev: ScannedItem[]) => ScannedItem[]) => {
    if (externalScannedList && onScannedListChange) {
      onScannedListChange(updater(externalScannedList));
    } else {
      setInternalList(updater);
    }
  };

  const unevaluatedCount = scannedList.filter((item) => !item.isEvaluated).length;

  // カメラで ISBN を読み取ったとき
  const handleDetectIsbn = (isbn: string) => {
    if (isSearching) return;
    navigator.vibrate?.(50); // 読み取れたことを手に伝える（Android のみ）

    if (onSearchIsbn) {
      void onSearchIsbn(isbn);
      return;
    }

    // ISBN 検索につながるまでの仮表示
    const newBook: ScannedItem = {
      id: `scanned-${Date.now()}`,
      title: `ISBN ${isbn}`,
      statusText: '未評価・店頭価格未入力',
      isEvaluated: false,
      isNew: true, // ★ 新規追加フラグ
    };
    updateScannedList((prev) => [
      newBook,
      ...prev.map((b) => ({ ...b, isNew: false })),
    ]);
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
                    // ★ 新規追加された本に slide-down-active を付与！
                    item.isNew
                      ? 'slide-down-active bg-amber-50 border-amber-300 ring-2 ring-amber-300/50'
                      : 'bg-gray-50/50 border-gray-300 hover:bg-gray-100/60'
                  }`}
                >
                  {/* アイコン枠 */}
                  <div className={`w-9 h-11 border rounded flex items-center justify-center shrink-0 ${
                    item.isNew ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-gray-200 border-gray-300 text-gray-500'
                  }`}>
                    <div className="w-4 h-6 border border-current rounded-[2px] flex items-center justify-center">
                      <div className="w-2.5 h-0.5 bg-current" />
                    </div>
                  </div>

                  {/* 書籍タイトルとステータス */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-gray-900 truncate">
                        {item.title}
                      </h4>
                      {item.isNew && (
                        <span className="text-[9px] font-black text-amber-700 bg-amber-200 px-1 py-px rounded shrink-0">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5 truncate flex items-center gap-1">
                      {item.isEvaluated ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                          <span className="text-emerald-700 font-medium">{item.statusText}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-amber-600 inline" />
                          <span>{item.statusText}</span>
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
          onClick={() => {
            if (unevaluatedCount > 0 && onOpenEvaluation) {
              const firstUnevaluated = scannedList.find((b) => !b.isEvaluated) || scannedList[0];
              onOpenEvaluation(firstUnevaluated);
            }
          }}
          className="w-full bg-neutral-800 hover:bg-neutral-900 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md text-sm"
        >
          未評価の本を確認（{unevaluatedCount}冊）
        </button>
      </div>

    </div>
  );
};
