'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, FlaskConical } from 'lucide-react';
import type { DemandForecast } from '@/types/analytics.types';

// Always visible, never hidden: the forecast model is a demo trained on synthetic data.
export default function SyntheticDataBanner({ forecast }: { forecast: DemandForecast }) {
  const [open, setOpen] = useState(false);
  const isSynthetic = (forecast.evaluation?.source || '').toUpperCase().includes('SYNTHETIC');
  const hasNotes = Boolean(forecast.dataWarning);

  return (
    <div className="rounded-3xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-5 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-orange-500/5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
          <FlaskConical className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            {isSynthetic ? 'Demo forecast: trained on synthetic data' : 'About this forecast'}
          </p>
          <p className="mt-1 text-sm text-amber-800/90 dark:text-amber-200/80">
            {forecast.evaluation?.warning || 'Treat these numbers as estimates, not guarantees.'}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/70 px-2.5 py-1 font-mono text-[11px] text-amber-800 ring-1 ring-amber-200 dark:bg-white/5 dark:text-amber-200 dark:ring-amber-500/30">
              {forecast.method}
            </span>
            {hasNotes && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:underline dark:text-amber-300"
              >
                Data notes
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          <AnimatePresence initial={false}>
            {open && hasNotes && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pt-3 text-xs leading-relaxed text-amber-800/90 dark:text-amber-200/80"
              >
                {forecast.dataWarning}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
