'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ScanScreen } from '@/components/mobile/ScanScreen';

export default function MobileScanPage() {
  const router = useRouter();

  return (
    <main className="h-[100dvh] w-full bg-neutral-100 flex flex-col justify-center items-center overflow-hidden touch-manipulation">
      <div className="w-full max-w-[420px] h-full bg-white text-gray-900 flex flex-col justify-between overflow-hidden relative md:shadow-2xl md:rounded-[36px] md:border border-gray-200">
        <ScanScreen
          onBack={() => router.push('/')}
          onOpenEvaluation={() => router.push('/books/9784560027783')}
        />
      </div>
    </main>
  );
}
