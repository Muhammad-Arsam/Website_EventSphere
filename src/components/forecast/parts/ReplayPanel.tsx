'use client';

import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import type { ForecastReplay } from '@/types/analytics.types';
import { formatDate, formatInt, getReplayVerdict, type ReplayVerdict } from '../forecastHelpers';
import { CHART_COLORS } from '../forecastTheme';
import { PANEL, PanelHeader, PanelShell } from '../forecastPanels';
import AnimatedNumber from './AnimatedNumber';

const TONE = 'forest' as const;
const S = PANEL[TONE];

const VERDICT: Record<ReplayVerdict, { title: string; text: string }> = {
  model: { title: 'The model was closer on this event', text: 'Its average error was smaller than the naive baseline.' },
  naive: { title: 'The naive baseline was closer on this event', text: 'The simple baseline had a smaller average error than the model.' },
  tie: { title: 'The model and the baseline tied', text: 'Both had the same average error on this event.' },
};

const twoDecimals = (n: number) => n.toFixed(2);

// Backtest only: how far off would the model have been?
export default function ReplayPanel({ replay }: { replay: ForecastReplay }) {
  const verdict = getReplayVerdict(replay);
  const maxError = Math.max(replay.modelMeanAbsoluteErrorTickets, replay.naiveMeanAbsoluteErrorTickets, 0.01);

  const bars = [
    { label: 'Model', value: replay.modelMeanAbsoluteErrorTickets, color: CHART_COLORS.modelDark },
    { label: 'Naive baseline', value: replay.naiveMeanAbsoluteErrorTickets, color: '#d0d5dd' },
  ];

  return (
    <PanelShell tone={TONE}>
      <PanelHeader
        tone={TONE}
        title="Backtest replay"
        subtitle={`Forecast simulated as of ${formatDate(replay.simulatedAsOf)}, then compared with what really sold.`}
      />

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Average error comparison */}
        <div className={`rounded-2xl p-5 lg:col-span-2 ${S.tile}`}>
          <p className={`flex items-center gap-2 text-sm font-semibold ${S.accent}`}>
            <Scale className="h-4 w-4" /> Average error (tickets per tier)
          </p>
          <div className="mt-4 space-y-4">
            {bars.map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className={`font-medium ${S.body}`}>{bar.label}</span>
                  <span className={`text-xl font-bold ${S.strong}`}>
                    <AnimatedNumber value={bar.value} format={twoDecimals} />
                  </span>
                </div>
                <div className={`h-2.5 overflow-hidden rounded-full ${S.track}`}>
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
          <div className="mt-5 rounded-xl bg-white/10 p-3">
            <p className={`text-sm font-semibold ${S.strong}`}>{VERDICT[verdict].title}</p>
            <p className={`mt-0.5 text-xs ${S.muted}`}>{VERDICT[verdict].text} Lower is better.</p>
          </div>
        </div>

        {/* Per-tier table */}
        <div className="overflow-x-auto lg:col-span-3">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className={`text-left text-xs uppercase tracking-wide ${S.muted}`}>
                <th className="pb-3 pr-3 font-medium">Tier</th>
                <th className="pb-3 pr-3 text-right font-medium">Model</th>
                <th className="pb-3 pr-3 text-right font-medium">Naive</th>
                <th className="pb-3 pr-3 text-right font-medium">Actual</th>
                <th className="pb-3 text-right font-medium">Model / Naive error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {replay.tiers.map((t) => (
                <tr key={t.tierId} className={S.body}>
                  <td className={`py-3 pr-3 font-semibold ${S.strong}`}>{t.tierName}</td>
                  <td className="py-3 pr-3 text-right font-semibold text-amber-300">{formatInt(t.predictedSold)}</td>
                  <td className="py-3 pr-3 text-right font-semibold text-gray-300">{formatInt(t.naiveProjectedSold)}</td>
                  <td className="py-3 pr-3 text-right font-semibold text-brand-300">{formatInt(t.actualSold)}</td>
                  <td className="py-3 text-right">
                    <span className="font-semibold">{formatInt(t.absoluteModelErrorTickets)}</span>
                    <span className="mx-1 text-white/40">/</span>
                    <span className="font-semibold">{formatInt(t.absoluteNaiveErrorTickets)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className={`mt-5 text-xs leading-relaxed ${S.muted}`}>{replay.note}</p>
    </PanelShell>
  );
}
