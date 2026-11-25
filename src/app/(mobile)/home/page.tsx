import { Suspense } from 'react';
import { HomeWorkspace } from '../_components/home/HomeWorkspace';
import { INITIAL_BOOKS } from '../_data/mockData';

export default function MobileHomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
          読み込み中...
        </div>
      }
    >
      <HomeWorkspace initialBooks={INITIAL_BOOKS} />
    </Suspense>
  );
}
