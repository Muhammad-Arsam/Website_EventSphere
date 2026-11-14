'use client';

import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import type { EventAnalytics } from '@/types/analytics.types';
import { AnimatedNumber, formatInt, formatRs } from '../dashboardShared';
import { PANEL } from '../dashboardTheme';
import { getRates } from '../dashboardHelpers';
import RingGauge from './RingGauge';

const ENTRANCE = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
});

const MINT_GAUGE = `${PANEL.mint.card} flex items-center gap-5 p-6`;
const GLOW = 'pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand-300/25 blur-2xl';

// Three headline rates: occupancy, check-in rate and revenue per ticket.
// Both rings use palette greens (a darker teal for occupancy, a fresher green for check-in).
export default function RateGauges({ analytics }: { analytics: EventAnalytics }) {
  const rates = getRates(analytics);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      <motion.div {...ENTRANCE(0)} className={MINT_GAUGE}>
        <div className={GLOW} aria-hidden="true" />
        <RingGauge value={rates.occupancy} from="var(--color-brand-400)" to="var(--color-brand-900)" />
        <div className="relative min-w-0">
          <p className={`text-sm font-semibold ${PANEL.mint.muted}`}>Occupancy rate</p>
          <p className={`mt-1 text-sm ${PANEL.mint.body}`}>
            <b className={PANEL.mint.strong}>{formatInt(analytics.totalTicketsSold)}</b> of{' '}
            {formatInt(analytics.totalCapacity)} tickets sold
          </p>
        </div>
      </motion.div>

      <motion.div {...ENTRANCE(1)} className={MINT_GAUGE}>
        <div className={GLOW} aria-hidden="true" />
        <RingGauge value={rates.checkIn} from="var(--color-brand-300)" to="var(--color-brand-500)" />
        <div className="relative min-w-0">
          <p className={`text-sm font-semibold ${PANEL.mint.muted}`}>Check-in rate</p>
          <p className={`mt-1 text-sm ${PANEL.mint.body}`}>
            <b className={PANEL.mint.strong}>{formatInt(analytics.totalCheckedIn)}</b> of{' '}
            {formatInt(analytics.totalTicketsSold)} ticket holders arrived
          </p>
        </div>
      </motion.div>

      <motion.div {...ENTRANCE(2)} className={`${PANEL.forest.card} p-6`}>
        <div
          className="absolute inset-0 opacity-60"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          aria-hidden="true"
        />
        <Coins className="absolute -bottom-5 -right-5 h-28 w-28 text-white/10" strokeWidth={1.2} aria-hidden="true" />
        <div className="relative z-10 flex h-full flex-col justify-center">
          <p className="text-sm font-semibold text-white/70">Revenue per ticket</p>
          <p className="mt-2 whitespace-nowrap text-4xl font-bold tracking-tight">
            <AnimatedNumber value={rates.revenuePerTicket} format={formatRs} />
          </p>
          <p className="mt-2 text-sm text-white/70">Average across {formatInt(analytics.totalTicketsSold)} tickets sold</p>
        </div>
      </motion.div>
    </div>
  );
}
