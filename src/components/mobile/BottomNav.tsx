'use client';

import React from 'react';
import { Home as HomeIcon, ScanLine } from 'lucide-react';
import type { TabType } from './types';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="border-t border-gray-200 grid grid-cols-2 bg-white shrink-0 z-10">
      <button
        type="button"
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center justify-center py-2.5 transition-all active:scale-95 ${
          currentTab === 'home'
            ? 'bg-gray-200/60 text-gray-900 font-bold'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <HomeIcon
          className={`w-5 h-5 mb-0.5 transition-transform ${
            currentTab === 'home' ? 'scale-105' : ''
          }`}
        />
        <span className="text-[10px]">ホーム</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('scan')}
        className={`flex flex-col items-center justify-center py-2.5 transition-all active:scale-95 ${
          currentTab === 'scan'
            ? 'bg-gray-200/60 text-gray-900 font-bold'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <ScanLine
          className={`w-5 h-5 mb-0.5 transition-transform ${
            currentTab === 'scan' ? 'scale-105' : ''
          }`}
        />
        <span className="text-[10px]">ISBNスキャン</span>
      </button>
    </nav>
  );
}
