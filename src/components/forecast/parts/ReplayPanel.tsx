'use client';

import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import type { ForecastReplay } from '@/types/analytics.types';
import { formatDate, formatInt, getReplayVerdict, type ReplayVerdict } from '../forecastHelpers';
import { CARD, CHART_COLORS } from '../forecastTheme';
import AnimatedNumber from './AnimatedNumber';
import SectionHeader from './SectionHeader';

const VERDICT: Record<ReplayVerdict, { title: string; text: string }> = {
  model: { title: 'The model was closer on this event', text: 'Its average error was smaller than the naive baseline.' },
  naive: { title: 'The naive baseline was closer on this event', text: 'The simple baseline had a smaller average error than the model.' },
  tie: { title: 'The model and the baseline tied', text: 'Both had the same average error on this event.' },
};

const oneDecimal = (n: number) => n.toFixed(2);

// Backtest only: how far off would the model have been?
export default function ReplayPanel({ replay }: { replay: ForecastReplay }) {
  const verdict = getReplayVerdict(replay);
  const maxError = Math.max(replay.modelMeanAbsoluteErrorTickets, replay.naiveMeanAbsoluteErrorTickets, 0.01);

  const bars = [
    { label: 'Model', value: replay.modelMeanAbsoluteErrorTickets, color: CHART_COLORS.model },
    { label: 'Naive baseline', value: replay.naiveMeanAbsoluteErrorTickets, color: CHART_COLORS.naive },
  ];

  return (
    <section className={`${CARD} p-5 sm:p-6`}>
      <SectionHeader
        title="Backtest replay"
        subtitle={`Forecast simulated as of ${formatDate(replay.simulatedAsOf)}, then compared with what really sold.`}
      />

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Average error comparison */}
        <div className="rounded-2xl bg-sky-50 p-5 ring-1 ring-sky-100 dark:bg-sky-500/10 dark:ring-sky-500/20 lg:col-span-2">
          <p className="flex items-center gap-2 text-sm font-semibold text-sky-800 dark:text-sky-200">
            <Scale className="h-4 w-4" /> Average error (tickets per tier)
          </p>
          <div className="mt-4 space-y-4">
            {bars.map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{bar.label}</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    <AnimatedNumber value={bar.value} format={oneDecimal} />
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/80 dark:bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: bar.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(bar.value / maxError) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-white/70 p-3 dark:bg-white/5">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{VERDICT[verdict].title}</p>
            <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{VERDICT[verdict].text} Lower is better.</p>
          </div>
        </div>

        {/* Per-tier table */}
        <div className="overflow-x-auto lg:col-span-3">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <th className="pb-3 pr-3 font-medium">Tier</th>
                <th className="pb-3 pr-3 text-right font-medium">Model</th>
                <th className="pb-3 pr-3 text-right font-medium">Naive</th>
                <th className="pb-3 pr-3 text-right font-medium">Actual</th>
                <th className="pb-3 text-right font-medium">Model / Naive error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {replay.tiers.map((t) => (
                <tr key={t.tierId} className="text-gray-700 dark:text-gray-300">
                  <td className="py-3 pr-3 font-semibold text-gray-900 dark:text-white">{t.tierName}</td>
                  <td className="py-3 pr-3 text-right font-semibold text-violet-600 dark:text-violet-300">{formatInt(t.predictedSold)}</td>
                  <td className="py-3 pr-3 text-right font-semibold text-amber-600 dark:text-amber-300">{formatInt(t.naiveProjectedSold)}</td>
                  <td className="py-3 pr-3 text-right font-semibold text-sky-600 dark:text-sky-300">{formatInt(t.actualSold)}</td>
                  <td className="py-3 text-right">
                    <span className="font-semibold">{formatInt(t.absoluteModelErrorTickets)}</span>
                    <span className="mx-1 text-gray-400">/</span>
                    <span className="font-semibold">{formatInt(t.absoluteNaiveErrorTickets)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{replay.note}</p>
    </section>
  );
}
