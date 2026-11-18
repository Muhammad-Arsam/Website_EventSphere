'use client';

import { useId, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { clamp01 } from '../forecastHelpers';
import { CHART_COLORS } from '../forecastTheme';

interface Props {
  sold: number; // fraction 0-1 (tickets sold / capacity)
  projected: number; // fraction 0-1 (projected sold / capacity)
  size?: number;
  stroke?: number;
  children?: ReactNode; // content shown in the middle of the ring
}

// Made for the dark green top of a tier card.
// Two arcs on one ring: the faint amber arc is the projection, the green arc is what is sold now.
export default function ProgressRing({ sold, projected, size = 118, stroke = 11, children }: Props) {
  const reduceMotion = useReducedMotion();
  const gradientId = useId();
  const radius = (size - stroke) / 2;
  const center = size / 2;

  const arcProps = (value: number, delay: number) => ({
    initial: reduceMotion ? false : { pathLength: 0 },
    animate: { pathLength: clamp01(value) },
    transition: { duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c9f0dc" />
            <stop offset="100%" stopColor={CHART_COLORS.brand300} />
          </linearGradient>
        </defs>
        <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={stroke} className="stroke-white/15" />
        <motion.circle cx={center} cy={center} r={radius} fill="none" strokeWidth={stroke}
          strokeLinecap="round" stroke={CHART_COLORS.modelDark} strokeOpacity={0.55}
          {...arcProps(projected, 0.1)} />
        <motion.circle cx={center} cy={center} r={radius} fill="none" strokeWidth={stroke}
          strokeLinecap="round" stroke={`url(#${gradientId})`}
          {...arcProps(sold, 0.25)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
