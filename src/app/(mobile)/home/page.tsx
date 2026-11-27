import { Suspense } from 'react';
import { getMyCollection } from '@/features/collection/server';
import { HomeWorkspace } from '../_components/home/HomeWorkspace';
import { toBookItem } from '../_data/fromCollection';

export default function MobileHomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
          読み込み中...
        </div>
      }
    >
      <MyBooks />
    </Suspense>
  );
}

// ログインユーザーの保存済みの本（スキャンが新しい順）
async function MyBooks() {
  const items = await getMyCollection();
  return <HomeWorkspace initialBooks={items.map(toBookItem)} />;
}
