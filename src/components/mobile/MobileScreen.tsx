'use client';

import React, { useState, useRef } from 'react';
import { BookOpen, Home as HomeIcon, ScanLine, X, Sparkles, ChevronUp, ChevronDown, CheckCircle2, Bookmark, ChevronRight, Flag, ShoppingCart, Clock, Ban, Star, Quote, PenLine } from 'lucide-react';
import { ScanScreen } from './ScanScreen';

type SheetState = 'closed' | 'half' | 'full';
type TabType = 'home' | 'scan';
export type FlagType = 'none' | 'purchased' | 'pending' | 'skip';

export interface BookItem {
  id: string;
  title: string;
  author: string;
  scanDate: string;
  categoryTag?: string;
  originalPrice: number;
  shopPrice: number;
  rank?: 'S' | 'A' | 'B';
  isEvaluated?: boolean; // お宝度判定済みかどうか（false = スキャン直後・未入力）
  storeName: string;
  isbn: string;
  publishedYear: string;
  publishedDate?: string; // 発売日（例: '2013年10月25日'）
  publisher?: string;     // 出版社（例: '白水社'）
  reviewRating?: number;  // ネットレビュー評価（例: 4.4）
  reviewCount?: number;   // レビュー件数（例: 168）
  reviewSnippet?: string; // 代表的な読者レビューの一言
  reviewSource?: string;  // レビュー元（例: 'Amazon / 読書メーター'）
  description: string;
  flag?: FlagType;
}

const INITIAL_BOOKS: BookItem[] = [
  // 1. スキャンしただけで、まだ店頭価格とお宝度判定をしていない本（未評価）
  {
    id: 'book-unrated-1',
    title: '夜を読む ―失われた読書体験を求めて',
    author: 'アルベルト・マングェル',
    scanDate: 'たった今',
    categoryTag: '文学・エッセイ',
    originalPrice: 2420,
    shopPrice: 0, // 未入力
    isEvaluated: false, // 未判定！
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
  // 2. お宝判定済みの本（評価済み・保留中）
  {
    id: 'book-1',
    title: '古書のある風景',
    author: '山田 文子',
    scanDate: '今日 10:24',
    categoryTag: 'サンプル書籍',
    originalPrice: 1980,
    shopPrice: 330,
    rank: 'A',
    isEvaluated: true,
    storeName: 'ブックオフ 渋谷店',
    isbn: '9784123456789',
    publishedYear: '2018年',
    publishedDate: '2018年4月12日',
    publisher: '街歩き文庫',
    reviewRating: 4.2,
    reviewCount: 84,
    reviewSnippet: '街の片隅の小さな古本屋を巡る心温まるエッセイ。週末に古本屋へ立ち寄りたくなる一冊。',
    reviewSource: 'ネット評価',
    description: '街の片隅に佇む小さな古本屋を巡る心温まるエッセイ。絶版となった名著との偶然の出会いから広がる物語を綴る。',
    flag: 'pending',
  },
  // 3. お宝判定済みの本（Sランク・購入済）
  {
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
  // 4. お宝判定済みの本
  {
    id: 'book-3',
    title: '達人プログラマー ―熟達に向けたあなたの旅',
    author: 'David Thomas, Andrew Hunt',
    scanDate: '10/12 14:10',
    categoryTag: '技術書',
    originalPrice: 3520,
    shopPrice: 1100,
    rank: 'A',
    isEvaluated: true,
    storeName: '三省堂書店 リサイクル棚',
    isbn: '9784274226298',
    publishedYear: '2020年',
    publishedDate: '2020年11月20日',
    publisher: 'オーム社',
    reviewRating: 4.6,
    reviewCount: 520,
    reviewSnippet: '道具の使い方からチームワーク、キャリア観まで、職人として成長し続けるための不朽の指針。',
    reviewSource: 'ネット評価',
    description: '変化の速いソフトウェア業界で、職人として誇りを持ち自立して学び続けるための実践的思考法。',
    flag: 'none',
  },
  // 5. お宝判定済みの本
  {
    id: 'book-4',
    title: '人月の神話 ―狼人間を撃つ銀の弾はない',
    author: 'Frederick P. Brooks Jr.',
    scanDate: '10/08 11:30',
    categoryTag: '名著・古典',
    originalPrice: 3080,
    shopPrice: 440,
    rank: 'S',
    isEvaluated: true,
    storeName: 'ブックオフ 新宿東口店',
    isbn: '9784839951603',
    publishedYear: '2014年',
    publishedDate: '2014年4月18日',
    publisher: '丸善出版',
    reviewRating: 4.5,
    reviewCount: 890,
    reviewSnippet: '「遅れている計画に人員を追加するとさらに遅れる」ブルックスの法則の原点。ソフトウェア工学の原典。',
    reviewSource: 'ネット評価',
    description: '大規模プロジェクト管理のバイブル。「遅れている計画に人員を追加するとさらに遅れる」という法則の原点。',
    flag: 'none',
  },
];

export function MobileScreen() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [viewMode] = useState<'empty' | 'single' | 'multiple'>('multiple');

  const [books, setBooks] = useState<BookItem[]>(INITIAL_BOOKS);
  const [sheetState, setSheetState] = useState<SheetState>('closed');
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(INITIAL_BOOKS[0]);
  const [isFlagMenuOpen, setIsFlagMenuOpen] = useState(false);

  // パターン1: インライン価格入力・お宝判定の状態管理
  const [isInputtingPrice, setIsInputtingPrice] = useState(false);
  const [priceInputValue, setPriceInputValue] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);

  const currentBooks: BookItem[] =
    viewMode === 'empty'
      ? []
      : viewMode === 'single'
      ? [books[0]]
      : books;

  const handleBookClick = (book: BookItem) => {
    setSelectedBook(book);
    setIsFlagMenuOpen(false);
    setIsInputtingPrice(false);
    setPriceInputValue('');
    setJustEvaluated(false);
    setSheetState('half');
  };

  const handleOpenEvaluationFromScan = (item: { title: string; isEvaluated?: boolean }) => {
    const matchedBook =
      books.find((b) => b.title === item.title) ||
      books.find((b) => b.title.includes(item.title) || item.title.includes(b.title)) ||
      (item.isEvaluated === false ? books.find((b) => !b.isEvaluated) : undefined) ||
      books[0];
    setSelectedBook(matchedBook);
    setIsFlagMenuOpen(false);
    setIsInputtingPrice(false);
    setPriceInputValue('');
    setJustEvaluated(false);
    setSheetState('half');
  };

  // お宝度判定の実行
  const handleExecuteEvaluation = (price: number) => {
    if (!selectedBook) return;

    const original = selectedBook.originalPrice;
    const discountRate = (original - price) / original;

    let rank: 'S' | 'A' | 'B' = 'B';
    if (discountRate >= 0.75) {
      rank = 'S';
    } else if (discountRate >= 0.50) {
      rank = 'A';
    } else {
      rank = 'B';
    }

    const updatedBook: BookItem = {
      ...selectedBook,
      isEvaluated: true,
      shopPrice: price,
      rank,
    };

    setSelectedBook(updatedBook);
    setBooks((prev) => prev.map((b) => (b.id === selectedBook.id ? updatedBook : b)));
    setIsInputtingPrice(false);
    setPriceInputValue('');
    setJustEvaluated(true);

    setTimeout(() => {
      setJustEvaluated(false);
    }, 3000);
  };

  const handleSetFlag = (flag: FlagType) => {
    if (!selectedBook) return;
    const updatedBook = { ...selectedBook, flag };
    setSelectedBook(updatedBook);
    setBooks((prev) => prev.map((b) => (b.id === selectedBook.id ? updatedBook : b)));
    setIsFlagMenuOpen(false);
  };

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
      setSheetState((prev) => (prev === 'half' ? 'full' : 'half'));
    } else {
      if (diffY > 60) {
        setSheetState('full');
      } else if (diffY < -60) {
        setSheetState((prev) => (prev === 'full' ? 'half' : 'closed'));
      }
    }

    dragStartY.current = null;
    isDragging.current = false;
  };

  const renderFlagBadge = (flag?: FlagType) => {
    switch (flag) {
      case 'purchased':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
            <ShoppingCart className="w-3 h-3" /> 購入済
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
            <Clock className="w-3 h-3" /> 保留中
          </span>
        );
      case 'skip':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-150 px-2 py-0.5 rounded-full border border-gray-300">
            <Ban className="w-3 h-3" /> 見送り
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-neutral-100 md:p-3 flex flex-col justify-center items-center overflow-hidden touch-manipulation">
      
      {/* 画面切り替えテストバー（PCデバッグ時のみ表示） */}
      <style>{`
        @keyframes tabFadeInCustom {
          0% {
            opacity: 0;
            transform: translateY(6px) scale(0.99);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-tab-change {
          animation: tabFadeInCustom 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        }
      `}</style>

      <div className="hidden md:flex mb-2 shrink-0 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200 items-center gap-2 text-xs">
        <span className="text-gray-400 font-bold text-[11px] mr-1">画面切り替え:</span>
        <button
          onClick={() => setCurrentTab('home')}
          className={`px-3 py-1 rounded-full font-bold transition-all ${
            currentTab === 'home'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          ホーム画面
        </button>
        <button
          onClick={() => setCurrentTab('scan')}
          className={`px-3 py-1 rounded-full font-bold transition-all ${
            currentTab === 'scan'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          ISBNスキャン画面
        </button>
      </div>

      {/* スマホ本体フレーム */}
      <div className="w-full max-w-[420px] h-full md:max-h-[min(844px,calc(100dvh-3.2rem))] bg-white text-gray-900 flex flex-col justify-between md:shadow-2xl md:rounded-[36px] overflow-hidden md:border border-gray-200 relative">
        
        {/* ======================================================== */}
        {/* メイン画面エリア（タブで切り替え ＋ 滑らかなフェードインアニメーション） */}
        {/* ======================================================== */}
        <div key={currentTab} className="flex-1 flex flex-col min-h-0 overflow-hidden animate-tab-change">
          
          {/* ① ISBNスキャン画面 */}
          {currentTab === 'scan' && (
            <ScanScreen
              onBack={() => setCurrentTab('home')}
              onOpenEvaluation={handleOpenEvaluationFromScan}
            />
          )}

          {/* ② ホーム画面 */}
          {currentTab === 'home' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              <header className="px-5 py-4 border-b border-gray-200 flex items-center gap-2.5 bg-white shrink-0">
                <BookOpen className="w-6 h-6 stroke-[2.2]" />
                <h1 className="text-xl font-bold tracking-tight">MineBook</h1>
              </header>

              <div className="p-5 flex-1 flex flex-col min-h-0">
                <section className="mt-1 shrink-0">
                  <h2 className="text-2xl font-bold leading-snug">
                    気になる一冊を、<br />
                    あなたの本棚へ。
                  </h2>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    裏表紙のISBNをスキャンして、<br />
                    店頭での発見を残しましょう。
                  </p>
                </section>

                <hr className="my-5 border-gray-200 shrink-0" />

                <section className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <h3 className="font-bold text-base flex items-center gap-1.5">
                      最近保存した本
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                        {currentBooks.length}
                      </span>
                    </h3>
                    <span className="text-[11px] text-gray-400">タップで詳細</span>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1 pb-1">
                    {currentBooks.map((book) => (
                      <button
                        key={book.id}
                        type="button"
                        onClick={() => handleBookClick(book)}
                        className="w-full text-left border border-gray-250 rounded-xl p-3 bg-gray-50/60 hover:bg-gray-100/60 active:bg-gray-150 cursor-pointer active:scale-[0.99] transition-all flex items-center gap-3.5 shadow-sm touch-manipulation"
                      >
                        <div className="w-12 h-16 bg-gray-200/90 border border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 shrink-0">
                          <BookOpen className="w-4 h-4 stroke-1 mb-0.5" />
                          <span className="text-[9px]">書影</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-gray-900 truncate">
                            {book.title}
                          </h4>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            {book.author}
                          </p>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-400">
                              {book.scanDate}
                            </span>
                            {!book.isEvaluated && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                <Clock className="w-2.5 h-2.5 text-amber-600" /> 未評価
                              </span>
                            )}
                            {renderFlagBadge(book.flag)}
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                      </button>
                    ))}
                  </div>
                </section>

                {/* ホーム画面内 スキャン誘導ボタン */}
                <div className="pt-6 pb-2 text-center mt-auto">
                  <p className="text-xs text-gray-400 mb-2">
                    本を見つけたら、ここから
                  </p>
                  <button
                    onClick={() => setCurrentTab('scan')}
                    className="w-full bg-neutral-800 hover:bg-neutral-900 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md"
                  >
                    スキャンを開始する
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* 全画面共通の最下部ナビゲーションバー（ホーム & ISBNスキャンの2分割） */}
        {/* ======================================================== */}
        <nav className="border-t border-gray-200 grid grid-cols-2 bg-white shrink-0 z-10">
          <button
            type="button"
            onClick={() => setCurrentTab('home')}
            className={`flex flex-col items-center justify-center py-2.5 transition-all active:scale-95 ${
              currentTab === 'home'
                ? 'bg-gray-200/60 text-gray-900 font-bold'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <HomeIcon className={`w-5 h-5 mb-0.5 transition-transform ${currentTab === 'home' ? 'scale-105' : ''}`} />
            <span className="text-[10px]">ホーム</span>
          </button>
          
          <button
            type="button"
            onClick={() => setCurrentTab('scan')}
            className={`flex flex-col items-center justify-center py-2.5 transition-all active:scale-95 ${
              currentTab === 'scan'
                ? 'bg-gray-200/60 text-gray-900 font-bold'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ScanLine className={`w-5 h-5 mb-0.5 transition-transform ${currentTab === 'scan' ? 'scale-105' : ''}`} />
            <span className="text-[10px]">ISBNスキャン</span>
          </button>
        </nav>

        {/* ======================================================== */}
        {/* 共通ボトムシート */}
        {/* ======================================================== */}
        {sheetState !== 'closed' && (
          <div
            onClick={() => {
              setSheetState('closed');
              setIsFlagMenuOpen(false);
            }}
            className="absolute inset-0 bg-black/40 z-40 transition-opacity duration-300 ease-out cursor-pointer"
          />
        )}

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

          {/* ヘッダー：「本詳細」＋ アクションアイコン群（フラグ、展開、閉じる） */}
          <div className="px-5 py-2 flex items-center justify-between shrink-0">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              本詳細
            </h2>

            <div className="flex items-center gap-1.5">
              {/* フラグボタン */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFlagMenuOpen(!isFlagMenuOpen)}
                  className={`p-2 rounded-full transition-all active:scale-90 ${
                    selectedBook?.flag === 'purchased'
                      ? 'text-emerald-700 bg-emerald-50'
                      : selectedBook?.flag === 'pending'
                      ? 'text-amber-700 bg-amber-50'
                      : selectedBook?.flag === 'skip'
                      ? 'text-gray-700 bg-gray-100'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="フラグを設定"
                >
                  <Flag className={`w-5 h-5 ${selectedBook?.flag && selectedBook.flag !== 'none' ? 'fill-current' : ''}`} />
                </button>

                {isFlagMenuOpen && (
                  <div
                    className="fixed inset-0 z-20 cursor-default"
                    onClick={() => setIsFlagMenuOpen(false)}
                  />
                )}

                {/* フラグドロップダウンメニュー */}
                <div
                  className={`absolute right-0 top-11 bg-white border border-gray-200 rounded-2xl shadow-xl p-1.5 w-44 z-30 transition-all duration-200 origin-top-right ${
                    isFlagMenuOpen
                      ? 'opacity-100 scale-100 pointer-events-auto'
                      : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  <p className="text-[10px] text-gray-400 font-bold px-3 py-1 uppercase tracking-wider">
                    ステータス選択
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSetFlag('purchased')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors active:bg-gray-150 ${
                      selectedBook?.flag === 'purchased'
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-gray-800 hover:bg-gray-100/70'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4 text-emerald-600" />
                    <span>購入（レジへ）</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetFlag('pending')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors active:bg-gray-150 ${
                      selectedBook?.flag === 'pending'
                        ? 'bg-amber-50 text-amber-800 font-bold'
                        : 'text-gray-800 hover:bg-gray-100/70'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>保留（棚に戻した）</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetFlag('skip')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors active:bg-gray-150 ${
                      selectedBook?.flag === 'skip'
                        ? 'bg-gray-100 text-gray-900 font-bold'
                        : 'text-gray-800 hover:bg-gray-100/70'
                    }`}
                  >
                    <Ban className="w-4 h-4 text-gray-500" />
                    <span>見送り（今回はパス）</span>
                  </button>
                  {selectedBook?.flag && selectedBook.flag !== 'none' && (
                    <button
                      type="button"
                      onClick={() => handleSetFlag('none')}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-colors border-t border-gray-100 mt-1"
                    >
                      フラグを解除
                    </button>
                  )}
                </div>
              </div>

              {/* 展開/縮小ボタン */}
              <button
                type="button"
                onClick={() => setSheetState((prev) => (prev === 'half' ? 'full' : 'half'))}
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
                onClick={() => {
                  setSheetState('closed');
                  setIsFlagMenuOpen(false);
                }}
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
                title="閉じる"
              >
                <X className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {selectedBook && (
            <>
              {/* スクロールコンテンツエリア */}
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

                {/* 発売日 & 出版社（左揃えキーバリュー） */}
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

                {/* 判定完了直後のアニメーションバナー */}
                {justEvaluated && (
                  <div className="mt-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-between shadow-md animate-pulse">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-yellow-200" />
                      <span>お宝判定完了！ RANK {selectedBook.rank} 獲得 🎉</span>
                    </div>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-black">
                      {Math.round((1 - selectedBook.shopPrice / selectedBook.originalPrice) * 100)}% OFF
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
                          {Math.round((1 - selectedBook.shopPrice / selectedBook.originalPrice) * 100)}% OFF
                        </span>
                      </div>
                      <span className={`text-white text-[11px] font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs ${
                        selectedBook.rank === 'S'
                          ? 'bg-amber-500'
                          : selectedBook.rank === 'A'
                          ? 'bg-indigo-500'
                          : 'bg-gray-600'
                      }`}>
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

                {/* ネットの評判カード（スクリーンショット準拠） */}
                {selectedBook.reviewRating && (
                  <div className="mt-4 bg-[#FEF8EF] rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900">
                        ネットの評判
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-500 fill-none stroke-[2]" />
                        <span className="text-base font-black text-gray-900">
                          {selectedBook.reviewRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400 font-normal">
                          ({selectedBook.reviewCount?.toLocaleString()}件)
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#9A6218] font-medium mt-1">
                      {selectedBook.reviewSource || 'Amazon / 読書メーター'}
                    </p>

                    {selectedBook.reviewSnippet && (
                      <div className="mt-3 bg-white rounded-xl p-3 shadow-2xs flex items-start gap-2.5">
                        <Quote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-800 leading-relaxed font-normal">
                          {selectedBook.reviewSnippet}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 全画面表示時に展開される追加情報 */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    sheetState === 'full' ? 'max-h-[500px] opacity-100 mt-5 space-y-4' : 'max-h-0 opacity-0'
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
                        <span className="font-bold text-gray-800">{selectedBook.storeName}</span>
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
                        <span className="font-bold text-gray-800">{selectedBook.scanDate}</span>
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
                            label: `半額 ¥${Math.round(selectedBook.originalPrice / 2).toLocaleString()}`,
                            val: Math.round(selectedBook.originalPrice / 2),
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
                        {parseInt(priceInputValue, 10) < selectedBook.originalPrice ? (
                          <>
                            <span>
                              {Math.round((1 - parseInt(priceInputValue, 10) / selectedBook.originalPrice) * 100)}% OFF
                            </span>
                            <span>・</span>
                            <span>
                              お得額: +¥{(selectedBook.originalPrice - parseInt(priceInputValue, 10)).toLocaleString()}
                            </span>
                            <span className={`text-[10px] text-white px-1.5 py-0.2 rounded font-black ${
                              (selectedBook.originalPrice - parseInt(priceInputValue, 10)) / selectedBook.originalPrice >= 0.75
                                ? 'bg-amber-500'
                                : 'bg-indigo-500'
                            }`}>
                              {(selectedBook.originalPrice - parseInt(priceInputValue, 10)) / selectedBook.originalPrice >= 0.75
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
                    {selectedBook.isEvaluated ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleSetFlag('purchased');
                              setSheetState('closed');
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

                {/* ホームインジケーター（PCビュー時のみ補助表示） */}
                <div className="hidden md:block w-28 h-1 bg-black rounded-full mx-auto mt-2 mb-0.5" />
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
