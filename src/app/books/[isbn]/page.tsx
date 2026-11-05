import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { BookDetailView } from '@/app/(mobile)/_components/book/BookDetailView';

interface BookPageProps {
  params: Promise<{ isbn: string }>;
}

export default function BookDetailPage({ params }: BookPageProps) {
  return (
    <main className="h-[100dvh] w-full bg-neutral-100 flex flex-col justify-center items-center overflow-hidden touch-manipulation">
      <div className="w-full max-w-[420px] h-full bg-white text-gray-900 flex flex-col justify-between overflow-hidden relative md:shadow-2xl md:rounded-[36px] md:border border-gray-200">
        {/* スマホ画面ヘッダー */}
        <header className="px-4 py-3.5 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <Link
            href="/home"
            className="p-1 -ml-1 text-gray-600 hover:text-gray-900 active:scale-95 transition-all flex items-center gap-1 text-xs font-bold"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>戻る</span>
          </Link>
          <h1 className="text-sm font-bold text-gray-900 tracking-tight">
            書籍詳細
          </h1>
          <div className="w-12" /> {/* スペーサー */}
        </header>

        {/* ルール3: params を読む処理は Suspense の中に置く */}
        <Suspense
          fallback={
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
              <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-medium">書籍情報を読み込み中...</p>
            </div>
          }
        >
          <BookDetailWithParams params={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function BookDetailWithParams({ params }: BookPageProps) {
  // ルール5: params は await してから使う
  const { isbn } = await params;
  return <BookDetailView isbn={isbn} />;
}
