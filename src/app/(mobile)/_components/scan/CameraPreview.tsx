'use client';

import React, { useRef, useState } from 'react';
import { CameraOff, Loader2, Zap, ZapOff } from 'lucide-react';
import { useBarcodeScanner, type CameraStatus } from './useBarcodeScanner';

const STATUS_MESSAGES: Record<Exclude<CameraStatus, 'scanning'>, string> = {
  starting: 'カメラを起動しています…',
  insecure: 'カメラは https のページでのみ使えます',
  denied: 'カメラの使用が許可されていません。ブラウザの設定でカメラを許可してください',
  unavailable: 'カメラが見つかりませんでした',
  error: 'カメラを起動できませんでした',
};

interface CameraPreviewProps {
  /** ISBN（978/979 で始まる 13 桁）を読み取ったときに呼ばれる */
  onDetect: (isbn: string) => void;
  /** true の間は読み取り中の表示にする（検索中など） */
  busy?: boolean;
}

// 背面カメラの映像と読み取り枠。ISBN のバーコードが映ると onDetect を呼ぶ
export function CameraPreview({ onDetect, busy = false }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [torchOn, setTorchOn] = useState(false);
  const { status, torchSupported } = useBarcodeScanner({
    videoRef,
    onDetect,
    torchOn,
  });

  return (
    <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {status === 'scanning' ? (
        // 読み取り枠（枠の外を暗くして、バーコードを合わせる位置を示す）
        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-24 border-2 border-white rounded-md shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
          <div
            className={`absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] ${
              busy ? 'animate-pulse' : 'opacity-70'
            }`}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-white">
          {status === 'starting' ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <CameraOff className="w-6 h-6" />
          )}
          <p className="text-xs font-bold leading-relaxed">
            {STATUS_MESSAGES[status]}
          </p>
        </div>
      )}

      {torchSupported && (
        <button
          type="button"
          onClick={() => setTorchOn((on) => !on)}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all active:scale-90 shadow-md z-10 flex items-center justify-center ${
            torchOn
              ? 'bg-amber-400 text-stone-900 ring-2 ring-amber-300 shadow-amber-400/40'
              : 'bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs'
          }`}
          title={torchOn ? 'ライトをオフ' : 'ライトをオン'}
        >
          {torchOn ? (
            <Zap className="w-4 h-4 fill-current" />
          ) : (
            <ZapOff className="w-4 h-4 text-white/90" />
          )}
        </button>
      )}
    </div>
  );
}
