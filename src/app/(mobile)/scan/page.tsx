import { Suspense } from 'react';
import { ScanWorkspace } from '../_components/scan/ScanWorkspace';
import { DEFAULT_SCANNED_LIST } from '../_data/mockData';

export default function MobileScanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
          読み込み中...
        </div>
      }
    >
      <ScanWorkspace initialScannedList={DEFAULT_SCANNED_LIST} />
    </Suspense>
  );
}
