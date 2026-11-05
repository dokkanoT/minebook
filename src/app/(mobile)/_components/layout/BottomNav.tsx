'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home as HomeIcon, ScanLine } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === '/home' || pathname === '/';
  const isScan = pathname.startsWith('/scan');

  return (
    <nav className="border-t border-gray-200 grid grid-cols-2 bg-white shrink-0 z-10">
      <Link
        href="/home"
        className={`flex flex-col items-center justify-center py-2.5 transition-all active:scale-95 ${
          isHome
            ? 'bg-gray-200/60 text-gray-900 font-bold'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <HomeIcon
          className={`w-5 h-5 mb-0.5 transition-transform ${isHome ? 'scale-105' : ''}`}
        />
        <span className="text-[10px]">ホーム</span>
      </Link>

      <Link
        href="/scan"
        className={`flex flex-col items-center justify-center py-2.5 transition-all active:scale-95 ${
          isScan
            ? 'bg-gray-200/60 text-gray-900 font-bold'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <ScanLine
          className={`w-5 h-5 mb-0.5 transition-transform ${isScan ? 'scale-105' : ''}`}
        />
        <span className="text-[10px]">ISBNスキャン</span>
      </Link>
    </nav>
  );
}
