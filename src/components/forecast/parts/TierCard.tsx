'use client';

import type { CSSProperties, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck2, Check, Flame, Lightbulb, TrendingUp } from 'lucide-react';
import type { ReplayTier, TierPrediction } from '@/types/analytics.types';
import {
  formatDate, formatInt, formatRs, fractionToPct, getStatusMeta, clamp01,
} from '../forecastHelpers';
import type { Tone } from '../forecastTheme';
import { PANEL } from '../forecastPanels';
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

const S = PANEL.mint;

// A ticket made of two parts: a deep green stub on top, a soft green stub below.
// The half-circle notches are REAL cut-outs (CSS mask), so the page background shows through
// whatever its colour is.
const NOTCH = 12;
const cutCorners = (edge: '0' | '100%'): CSSProperties => {
  const mask =
    `radial-gradient(circle ${NOTCH}px at 0 ${edge}, #0000 98%, #000) left / 51% 100% no-repeat, ` +
    `radial-gradient(circle ${NOTCH}px at 100% ${edge}, #0000 98%, #000) right / 51% 100% no-repeat`;
  return { WebkitMask: mask, mask };
};
const TOP_CUT = cutCorners('100%'); // cuts the bottom corners of the top stub
const BOTTOM_CUT = cutCorners('0'); // cuts the top corners of the bottom stub

const MINT_BG = 'bg-linear-to-br from-brand-25 via-brand-50 to-brand-100 dark:from-brand-900/60 dark:via-brand-950/70 dark:to-brand-900/50';

const STATUS_ON_DARK: Partial<Record<Tone, string>> = {
  amber: 'bg-amber-400/15 text-amber-200 ring-amber-300/30',
  brand: 'bg-brand-300/15 text-brand-200 ring-brand-300/30',
  rose: 'bg-rose-400/15 text-rose-200 ring-rose-300/30',
};

export default function TierCard({ tier, index, selected, onSelect, showRecommendation, replayTier }: Props) {
  const status = getStatusMeta(tier.status);
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
      className={`cursor-pointer rounded-3xl outline-none transition-[filter] focus-visible:ring-2 focus-visible:ring-brand-300 ${
        selected
          ? 'drop-shadow-[0_0_16px_rgba(111,207,151,0.75)]'
          : 'drop-shadow-[0_10px_18px_rgba(19,68,58,0.25)] hover:drop-shadow-[0_14px_24px_rgba(19,68,58,0.32)]'
      }`}
    >
      {/* ── Top stub (deep green) ── */}
      <div
        className="relative overflow-hidden rounded-t-3xl bg-linear-to-br from-brand-950 via-brand-900 to-brand-800 p-5 pb-7 text-white"
        style={TOP_CUT}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '18px 18px' }}
          aria-hidden="true"
        />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="truncate text-lg font-bold">{tier.tierName}</h4>
              <p className="text-sm text-white/65">{formatRs(tier.price)} per ticket</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_ON_DARK[status.tone] ?? 'bg-white/10 text-white/80 ring-white/20'}`}>
                {status.label}
              </span>
              {selected && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-300/20 px-2 py-0.5 text-[11px] font-semibold text-brand-200">
                  <Check className="h-3 w-3" /> On chart
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-5">
            <ProgressRing sold={soldFraction} projected={projectedFraction}>
              <span className="text-2xl font-bold leading-none">
                <AnimatedNumber value={tier.sold} />
              </span>
              <span className="mt-1 text-[11px] text-white/60">of {formatInt(tier.capacity)} sold</span>
            </ProgressRing>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">Model projection</p>
              <p className="mt-0.5 text-3xl font-bold leading-none text-amber-300">
                <AnimatedNumber value={tier.projectedSold} />
                <span className="ml-1 text-sm font-medium text-white/50">tickets</span>
              </p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-white/85">
                <TrendingUp className="h-3.5 w-3.5 text-amber-300" />
                {extra > 0 ? `+${formatInt(extra)} more expected` : 'No growth expected'}
              </p>
              <p className="mt-1 text-xs text-white/60">
                Naive baseline: <span className="font-semibold text-white/90">{formatInt(tier.naiveProjectedSold)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom stub (soft green) ── */}
      <div className={`relative space-y-4 rounded-b-3xl p-5 pt-7 ${MINT_BG}`} style={BOTTOM_CUT}>
        <div className="absolute inset-x-6 top-0 border-t-2 border-dashed border-brand-300/80 dark:border-white/15" aria-hidden="true" />

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className={`text-lg font-bold ${S.strong}`}>{fractionToPct(tier.projectedSellThrough)}</p>
            <p className={`text-[11px] ${S.muted}`}>Projected sell-through</p>
          </div>
          <div>
            <p className={`text-lg font-bold ${S.strong}`}>{fractionToPct(tier.sellOutProbability)}</p>
            <p className={`text-[11px] ${S.muted}`}>Sell-out chance</p>
          </div>
          <div>
            <p className={`text-lg font-bold ${S.strong}`}>{formatInt(tier.sold7d)}</p>
            <p className={`text-[11px] ${S.muted}`}>Sold, last 7 days</p>
          </div>
        </div>

        {/* Sell-out chance bar */}
        <div className={`h-1.5 overflow-hidden rounded-full ${S.track}`} aria-hidden="true">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-amber-300 to-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${sellOutPct}%` }}
            transition={{ duration: 1, delay: 0.3 + index * 0.09, ease: 'easeOut' }}
          />
        </div>

        <p className={`flex items-center gap-2 text-xs ${S.muted}`}>
          {tier.estSellOutDate ? (
            <><Flame className="h-4 w-4 text-amber-500" /> Estimated sell-out: <b className={S.strong}>{formatDate(tier.estSellOutDate)}</b></>
          ) : (
            <><CalendarCheck2 className="h-4 w-4 text-brand-500" /> No sell-out date estimated</>
          )}
          <span className="ml-auto">Last 3 days: {formatInt(tier.sold3d)}</span>
        </p>

        {showRecommendation && tier.recommendation && (
          <div className="flex gap-2.5 rounded-2xl bg-white/70 p-3 text-xs leading-relaxed text-brand-900 ring-1 ring-brand-100 dark:bg-white/5 dark:text-brand-100 dark:ring-white/10">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <span>{tier.recommendation}</span>
          </div>
        )}

        {replayTier && (
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-brand-100/80 p-3 text-center ring-1 ring-brand-200 dark:bg-brand-500/10 dark:ring-white/10">
            <div>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-300">{formatInt(replayTier.predictedSold)}</p>
              <p className={`text-[10px] ${S.muted}`}>Model said</p>
            </div>
            <div>
              <p className="text-sm font-bold text-brand-700 dark:text-brand-300">{formatInt(replayTier.actualSold)}</p>
              <p className={`text-[10px] ${S.muted}`}>Actually sold</p>
            </div>
            <div>
              <p className={`text-sm font-bold ${S.strong}`}>{formatInt(replayTier.absoluteModelErrorTickets)}</p>
              <p className={`text-[10px] ${S.muted}`}>Tickets off</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
