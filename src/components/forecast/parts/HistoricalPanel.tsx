'use client';

import { motion } from 'framer-motion';
import { Crown, Info } from 'lucide-react';
import type { ForecastHistorical } from '@/types/analytics.types';
import {
  clamp01, formatDate, formatInt, formatPct, formatRs, formatShortDate, getPhaseMeta,
} from '../forecastHelpers';
import { CARD } from '../forecastTheme';
import SectionHeader from './SectionHeader';

// Real sales data (not predictions). Shown for live and finished events.
export default function HistoricalPanel({ historical }: { historical: ForecastHistorical }) {
  const phase = getPhaseMeta(historical.eventPhase);

  const stats = [
    { label: 'Tickets sold', value: `${formatInt(historical.totalTicketsSold)} / ${formatInt(historical.totalCapacity)}` },
    { label: 'Overall sell-through', value: formatPct(historical.overallSellThroughPercent) },
    { label: 'Recorded order revenue', value: formatRs(historical.recordedOrderGross) },
    { label: 'Face value of tickets sold', value: formatRs(historical.faceValueGross) },
  ];

  return (
    <section className={`${CARD} p-5 sm:p-6`}>
      <SectionHeader
        title={phase.title}
        subtitle={`Real sales recorded through ${formatDate(historical.salesThroughDate)}.`}
        right={
          <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-300">
            {phase.label}
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-gray-50 p-4 dark:bg-white/5">
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {historical.tiers.map((tier, i) => {
          const isTop = tier.tierId === historical.topTierId;
          const fraction = clamp01(tier.actualSellThroughPercent / 100);
          return (
            <motion.div
              key={tier.tierId}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  {tier.tierName}
                  {isTop && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30">
                      <Crown className="h-3 w-3" /> Top tier
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatInt(tier.soldTickets)} / {formatInt(tier.capacity)} sold · {formatPct(tier.actualSellThroughPercent)} · {formatRs(tier.faceValueGross)}
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-linear-to-r from-brand-300 to-brand-600"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${fraction * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.15 + i * 0.07, ease: 'easeOut' }}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                <span>First sale: <b className="text-gray-700 dark:text-gray-300">{formatShortDate(tier.firstSaleDate)}</b></span>
                <span>Last sale: <b className="text-gray-700 dark:text-gray-300">{formatShortDate(tier.lastSaleDate)}</b></span>
                <span>
                  Best day: <b className="text-gray-700 dark:text-gray-300">{formatShortDate(tier.peakSalesDate)}</b>
                  {' '}({formatInt(tier.peakDailyTickets)} {tier.peakDailyTickets === 1 ? 'ticket' : 'tickets'})
                </span>
              </div>

              {tier.insight && (
                <p className="mt-3 flex gap-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" />
                  {tier.insight}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
