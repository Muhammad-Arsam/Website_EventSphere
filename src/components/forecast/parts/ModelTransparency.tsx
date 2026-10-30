'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit, ChevronDown } from 'lucide-react';
import type { ForecastEvaluation } from '@/types/analytics.types';
import { formatInt, formatPct } from '../forecastHelpers';
import { CARD, CHART_COLORS } from '../forecastTheme';

// "How good is this model?" Numbers come straight from the API (evaluation block).
export default function ModelTransparency({ evaluation }: { evaluation: ForecastEvaluation }) {
  const [open, setOpen] = useState(true);
  const maxMae = Math.max(evaluation.rfSellThroughMAEPercentagePoints, evaluation.naivePaceMAEPercentagePoints, 0.01);

  const bars = [
    { label: 'Random-forest model', value: evaluation.rfSellThroughMAEPercentagePoints, color: CHART_COLORS.model },
    { label: 'Naive pace baseline', value: evaluation.naivePaceMAEPercentagePoints, color: CHART_COLORS.naive },
  ];

  const facts = [
    { label: 'Training event groups', value: formatInt(evaluation.eventGroupsTrain) },
    { label: 'Hold-out event groups', value: formatInt(evaluation.eventGroupsHoldout) },
    { label: 'Hold-out snapshots', value: formatInt(evaluation.holdoutSnapshots) },
    { label: 'Sell-out Brier score', value: String(evaluation.sellOutProbabilityBrierScore) },
  ];

  return (
    <section className={`${CARD} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-5 text-left sm:p-6"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
          <BrainCircuit className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block text-lg font-bold text-gray-900 dark:text-white">How reliable is this model?</span>
          <span className="block text-sm text-gray-500 dark:text-gray-400">Evaluation on a hold-out set ({evaluation.source})</span>
        </span>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid gap-6 px-5 pb-6 sm:px-6 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Average sell-through error (percentage points, lower is better)
                </p>
                <div className="space-y-4">
                  {bars.map((bar) => (
                    <div key={bar.label}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{bar.label}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{formatPct(bar.value)}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: bar.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(bar.value / maxMae) * 100}%` }}
                          transition={{ duration: 0.9, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {facts.map((f) => (
                  <div key={f.label} className="rounded-2xl bg-gray-50 p-3.5 dark:bg-white/5">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{f.label}</p>
                    <p className="mt-0.5 text-base font-bold text-gray-900 dark:text-white">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
