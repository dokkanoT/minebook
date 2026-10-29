'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ScanLine, LayoutDashboard, LogIn } from 'lucide-react';
import { MobileScreen } from './(mobile)/_components/MobileScreen';

export default function Home() {
  return (
    <>
      {/* スマホ画面（768px 未満） */}
      <div className="block md:hidden h-full w-full">
        <MobileScreen />
      </div>

      {/* PC画面（768px 以上） */}
      <div className="hidden md:flex min-h-screen flex-col bg-neutral-100 text-neutral-900">
        <header className="border-b border-neutral-200 bg-white px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-neutral-900" />
            <span className="text-xl font-bold tracking-tight">MineBook</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              ログイン
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              ダッシュボードへ
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto">
          <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full mb-4 border border-amber-200">
            古本発掘・本棚管理 Web アプリ
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl leading-tight">
            古本との出会いを、<br />持ち帰れる本棚へ。
          </h1>
          <p className="mt-4 text-base text-neutral-600 max-w-xl leading-relaxed">
            古本屋で見つけた本をスマートフォンでスキャンし、書籍情報やお宝度を記録。<br />
            PCのバーチャル本棚で発掘履歴やコレクションを管理できます。
          </p>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <LayoutDashboard className="w-5 h-5" />
              PC版 ダッシュボードを開く
            </Link>
            <Link
              href="/scan"
              className="px-6 py-3 bg-white hover:bg-neutral-50 text-neutral-900 font-bold rounded-xl border border-neutral-300 shadow-sm transition-all flex items-center gap-2"
            >
              <ScanLine className="w-5 h-5 text-amber-700" />
              スマホ版 スキャン画面を開く
            </Link>
          </div>

          <div className="mt-12 p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm max-w-lg w-full text-left">
            <h2 className="text-sm font-bold text-neutral-800 mb-2">💡 デバイスごとの主な機能</h2>
            <ul className="text-xs text-neutral-600 space-y-1.5">
              <li>📱 <strong>スマートフォン</strong>: ISBNバーコードスキャン・お宝度判定・店頭価格記録</li>
              <li>💻 <strong>パソコン</strong>: バーチャル本棚・コレクション管理・発掘統計</li>
            </ul>
          </div>
        </main>
      </div>
    </>
  );
}
