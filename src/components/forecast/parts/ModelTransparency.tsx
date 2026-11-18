'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit, ChevronDown } from 'lucide-react';
import type { ForecastEvaluation } from '@/types/analytics.types';
import { formatInt, formatPct } from '../forecastHelpers';
import { CHART_COLORS } from '../forecastTheme';
import { PANEL, PanelShell } from '../forecastPanels';

const TONE = 'forest' as const;
const S = PANEL[TONE];

// "How good is this model?" Numbers come straight from the API (evaluation block).
export default function ModelTransparency({ evaluation }: { evaluation: ForecastEvaluation }) {
  const [open, setOpen] = useState(true);
  const maxMae = Math.max(evaluation.rfSellThroughMAEPercentagePoints, evaluation.naivePaceMAEPercentagePoints, 0.01);

  const bars = [
    { label: 'Random-forest model', value: evaluation.rfSellThroughMAEPercentagePoints, color: CHART_COLORS.modelDark },
    { label: 'Naive pace baseline', value: evaluation.naivePaceMAEPercentagePoints, color: '#d0d5dd' },
  ];

  const facts = [
    { label: 'Training event groups', value: formatInt(evaluation.eventGroupsTrain) },
    { label: 'Hold-out event groups', value: formatInt(evaluation.eventGroupsHoldout) },
    { label: 'Hold-out snapshots', value: formatInt(evaluation.holdoutSnapshots) },
    { label: 'Sell-out Brier score', value: String(evaluation.sellOutProbabilityBrierScore) },
  ];

  return (
    <PanelShell tone={TONE}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-brand-300 ring-1 ring-white/10">
          <BrainCircuit className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className={`block text-lg font-bold ${S.title}`}>How reliable is this model?</span>
          <span className={`block text-sm ${S.subtitle}`}>Evaluation on a hold-out set ({evaluation.source})</span>
        </span>
        <ChevronDown className={`h-5 w-5 text-white/60 transition-transform ${open ? 'rotate-180' : ''}`} />
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
            <div className="grid gap-6 pt-6 lg:grid-cols-2">
              <div>
                <p className={`mb-3 text-sm font-semibold ${S.body}`}>
                  Average sell-through error (percentage points, lower is better)
                </p>
                <div className="space-y-4">
                  {bars.map((bar) => (
                    <div key={bar.label}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className={S.muted}>{bar.label}</span>
                        <span className={`font-bold ${S.strong}`}>{formatPct(bar.value)}</span>
                      </div>
                      <div className={`h-2.5 overflow-hidden rounded-full ${S.track}`}>
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
                  <div key={f.label} className={`rounded-2xl p-3.5 ${S.tile}`}>
                    <p className={`text-[11px] ${S.muted}`}>{f.label}</p>
                    <p className={`mt-0.5 text-base font-bold ${S.strong}`}>{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PanelShell>
  );
}
