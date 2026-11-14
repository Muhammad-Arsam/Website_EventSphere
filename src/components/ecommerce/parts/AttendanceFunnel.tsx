'use client';

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import type { EventAnalytics } from '@/types/analytics.types';
import { formatInt, formatPct } from '../dashboardShared';
import { PANEL } from '../dashboardTheme';
import { getRates } from '../dashboardHelpers';
import PanelHeader from './PanelHeader';
import PanelShell from './PanelShell';

const TONE = 'mint' as const;
const S = PANEL[TONE];

// Capacity -> tickets sold -> checked in, as three shrinking bars.
export default function AttendanceFunnel({ analytics }: { analytics: EventAnalytics }) {
  const rates = getRates(analytics);

  const stages = [
    { label: 'Capacity', value: analytics.totalCapacity, width: 100, bar: 'from-brand-200 to-brand-300 dark:from-brand-500/40 dark:to-brand-500/25' },
    { label: 'Tickets sold', value: analytics.totalTicketsSold, width: rates.occupancy, bar: 'from-brand-400 to-brand-600' },
    { label: 'Checked in', value: analytics.totalCheckedIn, width: rates.checkedInOfCapacity, bar: 'from-brand-700 to-brand-900' },
  ];

  const steps = [
    `${formatPct(rates.occupancy)} of capacity was sold`,
    `${formatPct(rates.checkIn)} of ticket holders checked in`,
  ];

  return (
    <PanelShell tone={TONE}>
      <PanelHeader tone={TONE} title="Attendance funnel" subtitle="From available seats to people at the door" />

      <div className="space-y-1">
        {stages.map((stage, i) => (
          <div key={stage.label}>
            {i > 0 && (
              <p className={`flex items-center gap-1.5 py-1.5 pl-1 text-xs ${S.muted}`}>
                <ArrowDown className="h-3.5 w-3.5 text-brand-500" /> {steps[i - 1]}
              </p>
            )}
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className={`text-sm font-semibold ${S.body}`}>{stage.label}</span>
              <span className={`text-sm ${S.muted}`}>
                <b className={`text-base ${S.strong}`}>{formatInt(stage.value)}</b>
                {i > 0 && <> · {formatPct(stage.width)} of capacity</>}
              </span>
            </div>
            <div className={`h-5 overflow-hidden rounded-full ${S.track}`}>
              <motion.div
                className={`h-full rounded-full bg-linear-to-r ${stage.bar}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.max(Math.min(stage.width, 100), stage.value > 0 ? 3 : 0)}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, delay: 0.1 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className={`mt-5 text-xs ${S.muted}`}>Bar widths show each stage as a share of total capacity.</p>

      <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
        <div className={`rounded-2xl p-4 ${S.tile}`}>
          <p className={`text-2xl font-bold ${S.strong}`}>{formatInt(rates.unsold)}</p>
          <p className={`text-xs ${S.muted}`}>Seats still available</p>
        </div>
        <div className={`rounded-2xl p-4 ${S.tile}`}>
          <p className={`text-2xl font-bold ${S.strong}`}>{formatInt(analytics.totalPendingEntry)}</p>
          <p className={`text-xs ${S.muted}`}>Tickets yet to arrive</p>
        </div>
      </div>
    </PanelShell>
  );
}
