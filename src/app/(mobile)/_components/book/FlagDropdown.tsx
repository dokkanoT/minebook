'use client';

import React, { useState } from 'react';
import { Flag, ShoppingCart, Clock, Ban } from 'lucide-react';
import type { FlagType } from '../../_data/types';

interface FlagDropdownProps {
  currentFlag?: FlagType;
  onSelectFlag: (flag: FlagType) => void;
}

export function FlagDropdown({ currentFlag, onSelectFlag }: FlagDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (flag: FlagType) => {
    onSelectFlag(flag);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-all active:scale-90 ${
          currentFlag === 'purchased'
            ? 'text-emerald-700 bg-emerald-50'
            : currentFlag === 'pending'
            ? 'text-amber-700 bg-amber-50'
            : currentFlag === 'skip'
            ? 'text-gray-700 bg-gray-100'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
        }`}
        title="フラグを設定"
      >
        <Flag
          className={`w-5 h-5 ${
            currentFlag && currentFlag !== 'none' ? 'fill-current' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-20 cursor-default"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ドロップダウンメニュー */}
      <div
        className={`absolute right-0 top-11 bg-white border border-gray-200 rounded-2xl shadow-xl p-1.5 w-44 z-30 transition-all duration-200 origin-top-right ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <p className="text-[10px] text-gray-400 font-bold px-3 py-1 uppercase tracking-wider">
          ステータス選択
        </p>
        <button
          type="button"
          onClick={() => handleSelect('purchased')}
          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors active:bg-gray-150 ${
            currentFlag === 'purchased'
              ? 'bg-emerald-50 text-emerald-800 font-bold'
              : 'text-gray-800 hover:bg-gray-100/70'
          }`}
        >
          <ShoppingCart className="w-4 h-4 text-emerald-600" />
          <span>購入（レジへ）</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelect('pending')}
          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors active:bg-gray-150 ${
            currentFlag === 'pending'
              ? 'bg-amber-50 text-amber-800 font-bold'
              : 'text-gray-800 hover:bg-gray-100/70'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>保留（棚に戻した）</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelect('skip')}
          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors active:bg-gray-150 ${
            currentFlag === 'skip'
              ? 'bg-gray-100 text-gray-900 font-bold'
              : 'text-gray-800 hover:bg-gray-100/70'
          }`}
        >
          <Ban className="w-4 h-4 text-gray-500" />
          <span>見送り（今回はパス）</span>
        </button>
        {currentFlag && currentFlag !== 'none' && (
          <button
            type="button"
            onClick={() => handleSelect('none')}
            className="w-full text-left px-3 py-1.5 rounded-xl text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-colors border-t border-gray-100 mt-1"
          >
            フラグを解除
          </button>
        )}
      </div>
    </div>
  );
}
