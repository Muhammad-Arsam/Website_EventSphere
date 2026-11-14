'use client';

import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AnimatedNumber, formatPct } from '../dashboardShared';

interface Props {
  value: number; // percent 0-100
  from: string; // gradient start (a CSS color, for example var(--color-brand-300))
  to: string; // gradient end
  size?: number;
  stroke?: number;
}

// A single animated ring with the percentage in the middle.
export default function RingGauge({ value, from, to, size = 132, stroke = 12 }: Props) {
  const reduceMotion = useReducedMotion();
  const gradientId = useId();
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const fraction = Math.min(1, Math.max(0, value / 100));

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: from }} />
            <stop offset="100%" style={{ stopColor: to }} />
          </linearGradient>
        </defs>
        <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={stroke}
          className="stroke-white/80 dark:stroke-white/10" />
        {fraction > 0 && (
          <motion.circle
            cx={center} cy={center} r={radius} fill="none" strokeWidth={stroke}
            strokeLinecap="round" stroke={`url(#${gradientId})`}
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: fraction }}
            transition={{ duration: 1.3, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          <AnimatedNumber value={value} format={formatPct} />
        </span>
      </div>
    </div>
  );
}
