'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { AttendeeTicket } from '@/types/event.types';
import { formatInt } from '../dashboardShared';
import { PANEL } from '../dashboardTheme';
import { groupTicketsByTier } from '../dashboardHelpers';
import PanelHeader from './PanelHeader';
import PanelShell from './PanelShell';
import PanelState from './PanelState';

interface Props {
  tickets: AttendeeTicket[] | null;
  loading: boolean;
  error: string | null;
}

const TONE = 'mint' as const;
const S = PANEL[TONE];

// Real tickets grouped by tier, with how many of them have been checked in.
export default function TierBreakdown({ tickets, loading, error }: Props) {
  const tiers = useMemo(() => groupTicketsByTier(tickets ?? []), [tickets]);
  const maxTotal = Math.max(...tiers.map((t) => t.total), 1);
  const showFooter = tiers.length > 0 && !loading && !error;

  return (
    <PanelShell tone={TONE}>
      <PanelHeader tone={TONE} title="Tickets by tier" subtitle="Tickets issued and how many have arrived" />

      <PanelState
        tone={TONE}
        loading={loading}
        error={error}
        isEmpty={tiers.length === 0}
        emptyTitle="No tickets issued yet"
        emptyText="Tickets will show up here once attendees buy them."
      >
        <div className={`mb-4 flex flex-wrap gap-4 text-xs ${S.muted}`}>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-300" /> Tickets issued</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-700" /> Checked in</span>
        </div>

        <ul className="space-y-5">
          {tiers.map((tier, i) => (
            <li key={tier.name}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className={`truncate text-sm font-semibold ${S.strong}`}>{tier.name}</span>
                <span className={`shrink-0 text-xs ${S.muted}`}>
                  <b className={`text-sm ${S.strong}`}>{formatInt(tier.checkedIn)}</b> / {formatInt(tier.total)} checked in
                </span>
              </div>
              <div className={`relative h-3 rounded-full ${S.track}`}>
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-brand-300"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(tier.total / maxTotal) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: i * 0.08, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-brand-600 to-brand-800"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(tier.checkedIn / maxTotal) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: 0.15 + i * 0.08, ease: 'easeOut' }}
                />
              </div>
            </li>
          ))}
        </ul>
      </PanelState>

      {showFooter && (
        <div className={`mt-auto grid grid-cols-3 gap-3 border-t pt-5 ${S.divider}`}>
          {[
            { label: 'Tiers', value: formatInt(tiers.length) },
            { label: 'Tickets issued', value: formatInt(tiers.reduce((sum, t) => sum + t.total, 0)) },
            { label: 'Checked in', value: formatInt(tiers.reduce((sum, t) => sum + t.checkedIn, 0)) },
          ].map((item) => (
            <div key={item.label} className={`rounded-2xl p-3 text-center ${S.tile}`}>
              <p className={`text-lg font-bold ${S.strong}`}>{item.value}</p>
              <p className={`text-[11px] ${S.muted}`}>{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </PanelShell>
  );
}
