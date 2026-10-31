'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Gauge, Target, Ticket, Wallet } from 'lucide-react';
import type { DemandForecast } from '@/types/analytics.types';
import { buildKpis, formatPct, formatRs, type KpiIcon, type KpiKind } from '../forecastHelpers';
import { CARD, TONES } from '../forecastTheme';
import AnimatedNumber from './AnimatedNumber';

const ICONS: Record<KpiIcon, typeof Ticket> = {
  ticket: Ticket,
  target: Target,
  gauge: Gauge,
  wallet: Wallet,
  check: CheckCircle2,
};

const FORMATTERS: Record<KpiKind, ((n: number) => string) | undefined> = {
  int: undefined, // AnimatedNumber default (whole number)
  percent: formatPct,
  money: formatRs,
};

export default function SummaryStats({ forecast }: { forecast: DemandForecast }) {
  const kpis = buildKpis(forecast);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, i) => {
        const Icon = ICONS[kpi.icon];
        const tone = TONES[kpi.tone];
        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            className={`${CARD} group relative overflow-hidden p-6 transition-shadow hover:shadow-xl`}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-400 to-brand-600" />
            <Icon
              className="absolute -bottom-6 -right-6 h-28 w-28 text-gray-100 transition-transform duration-500 group-hover:scale-110 dark:text-white/3"
              strokeWidth={1.2}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{kpi.label}</span>
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${tone.icon}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <h3 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white xl:text-[2rem]">
                <AnimatedNumber value={kpi.value} format={FORMATTERS[kpi.kind]} />
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{kpi.caption}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
