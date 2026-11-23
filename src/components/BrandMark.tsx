import React from 'react';

interface BrandMarkProps {
  label?: string;
  compact?: boolean;
  inverted?: boolean;
}

export function BrandMark({
  label = 'Aarogya Care',
  compact = false,
  inverted = false,
}: BrandMarkProps) {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <span
        className={`inline-flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
          inverted ? 'bg-white/15 text-white' : 'bg-teal-700 text-white'
        }`}
        aria-hidden="true"
      >
        {/* Heart + ECG Pulse emblem inspired by Aarogya Care showcase */}
        <svg viewBox="0 0 28 28" className="w-5 h-5" fill="none">
          <path
            d="M14 24.2S4.5 18.4 4.5 11.1c0-3.1 2.4-5.6 5.4-5.6 1.8 0 3.3.9 4.1 2.3.8-1.4 2.3-2.3 4.1-2.3 3 0 5.4 2.5 5.4 5.6 0 7.3-9.5 13.1-9.5 13.1Z"
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 14h3.3l1.6-3.4 2.5 6.4 2-4.2 1.2 1.2h4.4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact && (
        <span
          className={`font-display text-lg font-bold tracking-tight ${
            inverted ? 'text-white' : 'text-slate-900'
          }`}
        >
          {label}
        </span>
      )}
    </span>
  );
}
