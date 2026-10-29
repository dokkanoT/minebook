'use client';

import React from 'react';
import { PenLine, Sparkles } from 'lucide-react';

interface PriceInputSectionProps {
  originalPrice: number;
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onEvaluate: (price: number) => void;
}

export function PriceInputSection({
  originalPrice,
  value,
  onChange,
  onCancel,
  onEvaluate,
}: PriceInputSectionProps) {
  const numericVal = parseInt(value, 10);
  const isValid = !isNaN(numericVal) && numericVal >= 0;

  const quickPrices = [
    { label: '¥110', val: 110 },
    { label: '¥220', val: 220 },
    { label: '¥330', val: 330 },
    { label: '¥440', val: 440 },
    { label: '¥550', val: 550 },
    {
      label: `半額 ¥${Math.round(originalPrice / 2).toLocaleString()}`,
      val: Math.round(originalPrice / 2),
    },
  ];

  return (
    <div className="space-y-2.5 animate-slide-down">
      {/* タイトル & キャンセル */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
          <PenLine className="w-3.5 h-3.5 text-[#9E6219]" />
          古本屋の店頭価格（税込）
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-gray-400 hover:text-gray-700 font-medium px-1.5 py-0.5 cursor-pointer"
        >
          キャンセル
        </button>
      </div>

      {/* クイック選択チップ */}
      <div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {quickPrices.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onChange(String(item.val))}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all active:scale-95 border cursor-pointer ${
                value === String(item.val)
                  ? 'bg-[#9E6219] text-white border-[#9E6219] shadow-xs'
                  : 'bg-[#FEF8F0] hover:bg-amber-100/70 text-[#9E6219] border-amber-200/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 金額入力 ＋ 判定ボタン */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
            ¥
          </span>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="金額を入力"
            autoFocus
            className="w-full bg-gray-50 border-2 border-gray-250 focus:border-[#9E6219] focus:bg-white rounded-xl py-2 pl-7 pr-7 text-base font-bold text-gray-900 outline-none transition-all"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 text-[10px] flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (isValid) {
              onEvaluate(numericVal);
            }
          }}
          disabled={!isValid}
          className="px-5 py-2.5 bg-[#9E6219] disabled:bg-gray-200 disabled:text-gray-400 hover:bg-[#8A5414] active:scale-95 text-white font-bold text-sm rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          判定する！
        </button>
      </div>

      {/* リアルタイムお宝度プレビュー */}
      {isValid && (
        <div className="text-center text-xs font-bold py-1.5 px-2 rounded-lg bg-[#FEF8F0] text-[#9E6219] border border-amber-200/80 flex items-center justify-center gap-2">
          {numericVal < originalPrice ? (
            <>
              <span>
                {Math.round((1 - numericVal / originalPrice) * 100)}% OFF
              </span>
              <span>・</span>
              <span>
                お得額: +¥{(originalPrice - numericVal).toLocaleString()}
              </span>
              <span
                className={`text-[10px] text-white px-1.5 py-0.2 rounded font-black ${
                  (originalPrice - numericVal) / originalPrice >= 0.75
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
                }`}
              >
                {(originalPrice - numericVal) / originalPrice >= 0.75
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
  );
}
