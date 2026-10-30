'use client';

import type { KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck2, Flame, Lightbulb, TrendingUp } from 'lucide-react';
import type { ReplayTier, TierPrediction } from '@/types/analytics.types';
import {
  clamp01, formatDate, formatInt, formatRs, fractionToPct, getStatusMeta,
} from '../forecastHelpers';
import { CARD, TONES } from '../forecastTheme';
import AnimatedNumber from './AnimatedNumber';
import ProgressRing from './ProgressRing';

interface Props {
  tier: TierPrediction;
  index: number;
  selected: boolean;
  onSelect: () => void;
  showRecommendation: boolean;
  replayTier?: ReplayTier; // backtest only
}

// The little half-circles that make the card look like a torn ticket stub.
const NOTCH_BG = 'border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900';

export default function TierCard({ tier, index, selected, onSelect, showRecommendation, replayTier }: Props) {
  const status = getStatusMeta(tier.status);
  const statusTone = TONES[status.tone];
  const soldFraction = tier.capacity ? tier.sold / tier.capacity : 0;
  const projectedFraction = tier.capacity ? tier.projectedSold / tier.capacity : 0;
  const extra = tier.projectedSold - tier.sold;
  const sellOutPct = clamp01(tier.sellOutProbability) * 100;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${tier.tierName} tier. Show on chart`}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1 + index * 0.09, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      className={`${CARD} relative cursor-pointer outline-none transition-shadow hover:shadow-xl focus-visible:ring-2 focus-visible:ring-brand-500 ${
        selected ? 'border-brand-400! ring-2 ring-brand-500/25 dark:border-brand-500/60!' : ''
      }`}
    >
      {/* ── Top half ── */}
      <div className="p-5 pb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="truncate text-lg font-bold text-gray-900 dark:text-white">{tier.tierName}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatRs(tier.price)} per ticket</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusTone.chip}`}>
            {status.label}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-5">
          <ProgressRing sold={soldFraction} projected={projectedFraction}>
            <span className="text-2xl font-bold leading-none text-gray-900 dark:text-white">
              <AnimatedNumber value={tier.sold} />
            </span>
            <span className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">of {formatInt(tier.capacity)} sold</span>
          </ProgressRing>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Model projection</p>
            <p className="mt-0.5 text-3xl font-bold leading-none text-violet-600 dark:text-violet-300">
              <AnimatedNumber value={tier.projectedSold} />
              <span className="ml-1 text-sm font-medium text-gray-400">tickets</span>
            </p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
              <TrendingUp className="h-3.5 w-3.5 text-violet-500" />
              {extra > 0 ? `+${formatInt(extra)} more expected` : 'No growth expected'}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Naive baseline: <span className="font-semibold text-amber-600 dark:text-amber-300">{formatInt(tier.naiveProjectedSold)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Perforated divider ── */}
      <div className="relative h-px">
        <div className="absolute left-0 top-1/2 h-6 w-3 -translate-y-1/2 overflow-hidden">
          <span className={`-ml-3 block h-6 w-6 rounded-full ${NOTCH_BG}`} />
        </div>
        <div className="absolute right-0 top-1/2 h-6 w-3 -translate-y-1/2 overflow-hidden">
          <span className={`block h-6 w-6 rounded-full ${NOTCH_BG}`} />
        </div>
        <div className="mx-5 border-t-2 border-dashed border-gray-200 dark:border-gray-700" />
      </div>

      {/* ── Bottom half ── */}
      <div className="space-y-4 p-5 pt-6">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{fractionToPct(tier.projectedSellThrough)}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Projected sell-through</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{fractionToPct(tier.sellOutProbability)}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Sell-out chance</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatInt(tier.sold7d)}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Sold, last 7 days</p>
          </div>
        </div>

        {/* Sell-out chance bar */}
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10" aria-hidden="true">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-amber-400 to-rose-500"
            initial={{ width: 0 }}
            animate={{ width: `${sellOutPct}%` }}
            transition={{ duration: 1, delay: 0.3 + index * 0.09, ease: 'easeOut' }}
          />
        </div>

        <p className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {tier.estSellOutDate ? (
            <><Flame className="h-4 w-4 text-rose-500" /> Estimated sell-out: <b className="text-gray-800 dark:text-gray-200">{formatDate(tier.estSellOutDate)}</b></>
          ) : (
            <><CalendarCheck2 className="h-4 w-4 text-gray-400" /> No sell-out date estimated</>
          )}
          <span className="ml-auto">Last 3 days: {formatInt(tier.sold3d)}</span>
        </p>

        {showRecommendation && tier.recommendation && (
          <div className="flex gap-2.5 rounded-2xl bg-brand-25 p-3 text-xs leading-relaxed text-brand-800 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-200 dark:ring-brand-500/20">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
            <span>{tier.recommendation}</span>
          </div>
        )}

        {replayTier && (
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-sky-50 p-3 text-center ring-1 ring-sky-100 dark:bg-sky-500/10 dark:ring-sky-500/20">
            <div>
              <p className="text-sm font-bold text-violet-600 dark:text-violet-300">{formatInt(replayTier.predictedSold)}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Model said</p>
            </div>
            <div>
              <p className="text-sm font-bold text-sky-700 dark:text-sky-300">{formatInt(replayTier.actualSold)}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Actually sold</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{formatInt(replayTier.absoluteModelErrorTickets)}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Tickets off</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
