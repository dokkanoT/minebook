'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

interface ReviewCardProps {
  rating?: number;
  count?: number;
  source?: string;
  snippet?: string;
}

export function ReviewCard({ rating, count, source, snippet }: ReviewCardProps) {
  if (!rating) return null;

  return (
    <div className="mt-4 bg-[#FEF8EF] rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-900">ネットの評判</h4>
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-amber-500 fill-none stroke-[2]" />
          <span className="text-base font-black text-gray-900">
            {rating.toFixed(1)}
          </span>
          {count && (
            <span className="text-xs text-gray-400 font-normal">
              ({count.toLocaleString()}件)
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-[#9A6218] font-medium mt-1">
        {source || 'Amazon / 読書メーター'}
      </p>

      {snippet && (
        <div className="mt-3 bg-white rounded-xl p-3 shadow-2xs flex items-start gap-2.5">
          <Quote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-800 leading-relaxed font-normal">
            {snippet}
          </p>
        </div>
      )}
    </div>
  );
}
