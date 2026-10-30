'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CalendarX2, LineChart, RefreshCw } from 'lucide-react';
import { CARD } from '../forecastTheme';

type Variant = 'empty' | 'error' | 'info';

interface Props {
  variant: Variant;
  title: string;
  text: string;
  onRetry?: () => void;
  children?: ReactNode;
}

const ICONS = { empty: CalendarX2, error: AlertTriangle, info: LineChart };

const BUBBLE: Record<Variant, string> = {
  empty: 'bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-300',
  error: 'bg-error-50 text-error-500 dark:bg-error-500/15 dark:text-error-400',
  info: 'bg-violet-50 text-violet-500 dark:bg-violet-500/15 dark:text-violet-300',
};

// One component for the empty, error and "no tiers" states.
export default function ForecastMessage({ variant, title, text, onRetry, children }: Props) {
  const Icon = ICONS[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${CARD} flex flex-col items-center justify-center border-dashed p-10 text-center`}
      role={variant === 'error' ? 'alert' : undefined}
    >
      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${BUBBLE[variant]}`}>
        <Icon className="h-7 w-7" />
      </div>
      <p className="mb-1 font-semibold text-gray-900 dark:text-white">{title}</p>
      <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">{text}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
      {children}
    </motion.div>
  );
}
