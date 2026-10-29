'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ScanScreen } from '../_components/scan/ScanScreen';

export default function MobileScanPage() {
  const router = useRouter();

  return (
    <ScanScreen
      onBack={() => router.push('/')}
      onOpenEvaluation={() => router.push('/books/9784560027783')}
    />
  );
}
