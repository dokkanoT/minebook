'use client';

import React, { useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import type { ScannedItem } from '../../_data/types';

interface ScanDeleteDialogProps {
  item: ScannedItem | null;
  isSaved?: boolean;
  isDeleting?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * 読取済みリストの削除確認ダイアログ
 */
export function ScanDeleteDialog({
  item,
  isSaved = false,
  isDeleting = false,
  error,
  onCancel,
  onConfirm,
}: ScanDeleteDialogProps) {
  useEffect(() => {
    if (!item || isDeleting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, isDeleting, onCancel]);

  if (!item) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-5">
      {/* 背景オーバーレイ */}
      <div
        aria-hidden="true"
        onClick={() => {
          if (!isDeleting) onCancel();
        }}
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px] transition-opacity"
      />

      {/* ダイアログ本体 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-delete-dialog-title"
        className="relative z-10 w-full max-w-[340px] bg-white rounded-2xl border border-gray-200 shadow-2xl p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4 text-rose-600" />
            </div>
            <h2
              id="scan-delete-dialog-title"
              className="text-sm font-bold text-gray-900"
            >
              スキャン履歴から削除しますか？
            </h2>
          </div>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            aria-label="閉じる"
            className="p-1 -mr-1 -mt-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
          <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
            {item.title}
          </p>
          <p className="text-[11px] text-gray-500 mt-1 truncate">
            {item.statusText}
          </p>
        </div>

        <p className="mt-3 text-xs text-gray-600 leading-relaxed">
          {isSaved
            ? 'この本はすでにコレクションへ保存されているため、マイコレクションからも削除されます。'
            : 'この本を読取済みリストから取り除きます。'}
        </p>

        {error && (
          <p
            role="alert"
            className="mt-3 text-[11px] text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5"
          >
            ⚠️ {error}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 active:scale-[0.99] text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
          >
            {isDeleting ? '削除中...' : '削除する'}
          </button>
        </div>
      </div>
    </div>
  );
}
