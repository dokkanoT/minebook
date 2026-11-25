'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';

type CoverSize = 'sm' | 'md' | 'lg';

interface BookCoverProps {
  coverUrl?: string;
  title: string;
  size?: CoverSize;
  highlighted?: boolean;
}

const SIZE_CONFIG: Record<
  CoverSize,
  { box: string; width: number; height: number; icon: string; showLabel: boolean }
> = {
  sm: {
    box: 'w-9 h-11 rounded border',
    width: 36,
    height: 44,
    icon: 'w-4 h-4 stroke-[1.6]',
    showLabel: false,
  },
  md: {
    box: 'w-12 h-16 rounded border border-gray-300',
    width: 48,
    height: 64,
    icon: 'w-4 h-4 stroke-1 mb-0.5',
    showLabel: true,
  },
  lg: {
    box: 'w-16 h-20 rounded-2xl border border-gray-200 shadow-sm',
    width: 64,
    height: 80,
    icon: 'w-6 h-6 stroke-[1.5] mb-1',
    showLabel: true,
  },
};

/**
 * 書籍の書影サムネイルを表示する共通部品。画像がない場合や読み込み失敗時はプレースホルダーを表示する
 */
export function BookCover({
  coverUrl,
  title,
  size = 'lg',
  highlighted = false,
}: BookCoverProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const cfg = SIZE_CONFIG[size];
  const canShowImage = Boolean(coverUrl) && failedUrl !== coverUrl;

  if (canShowImage && coverUrl) {
    return (
      <Image
        src={coverUrl}
        alt={`${title}の表紙`}
        width={cfg.width}
        height={cfg.height}
        unoptimized
        onError={() => setFailedUrl(coverUrl)}
        className={`${cfg.box} object-cover shrink-0 bg-gray-100`}
      />
    );
  }

  const placeholderTone =
    size === 'sm'
      ? highlighted
        ? 'bg-amber-100 border-amber-300 text-amber-700'
        : 'bg-gray-200 border-gray-300 text-gray-500'
      : size === 'md'
        ? 'bg-gray-200/90 text-gray-400'
        : 'bg-[#F0F1F2] border-transparent shadow-none text-gray-400';

  return (
    <div
      className={`${cfg.box} ${placeholderTone} flex flex-col items-center justify-center shrink-0`}
    >
      <BookOpen className={cfg.icon} />
      {cfg.showLabel && (
        <span className={size === 'md' ? 'text-[9px]' : 'text-[10px] font-medium'}>
          書影
        </span>
      )}
    </div>
  );
}
