'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { EventOrder } from '@/types/event.types';
import { formatRs } from '../dashboardShared';
import { ORDER_BADGE, PANEL, type OrderBucket } from '../dashboardTheme';
import { getOrderBucket, getOrderStats, getRecentOrders, initialOf, timeAgo } from '../dashboardHelpers';
import PanelHeader from './PanelHeader';
import PanelShell from './PanelShell';
import PanelState from './PanelState';

interface Props {
  orders: EventOrder[] | null;
  loading: boolean;
  error: string | null;
}

const TONE = 'forest' as const;
const S = PANEL[TONE];
const BUCKETS: OrderBucket[] = ['paid', 'pending', 'failed'];

// The latest orders of this event, plus a quick count by payment status.
export default function RecentOrdersCard({ orders, loading, error }: Props) {
  const stats = useMemo(() => getOrderStats(orders ?? []), [orders]);
  const recent = useMemo(() => getRecentOrders(orders ?? []), [orders]);

  return (
    <PanelShell tone={TONE}>
      <PanelHeader
        tone={TONE}
        title="Recent orders"
        subtitle="The latest purchases for this event"
        right={
          <Link href="/orders" className={`inline-flex items-center gap-1 text-sm font-semibold hover:underline ${S.accent}`}>
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <PanelState
        tone={TONE}
        loading={loading}
        error={error}
        isEmpty={recent.length === 0}
        emptyTitle="No orders yet"
        emptyText="New orders will appear here as people buy tickets."
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {BUCKETS.map((bucket) => (
            <span key={bucket} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${ORDER_BADGE[bucket].chipOnDark}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${ORDER_BADGE[bucket].dot}`} />
              {stats.counts[bucket]} {ORDER_BADGE[bucket].label}
            </span>
          ))}
        </div>

        <ul className="divide-y divide-white/10">
          {recent.map((order, i) => {
            const badge = ORDER_BADGE[getOrderBucket(order.paymentStatus)];
            return (
              <motion.li
                key={order.orderId}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-center gap-3 py-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-300 to-brand-500 text-sm font-bold text-brand-950">
                  {initialOf(order.buyerName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm font-semibold ${S.strong}`}>{order.buyerName || 'Unknown buyer'}</span>
                  <span className={`block truncate text-xs ${S.muted}`}>{order.orderReference} · {timeAgo(order.createdAt)}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className={`block text-sm font-bold ${S.strong}`}>{formatRs(order.totalAmount)}</span>
                  <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${badge.chipOnDark}`}>
                    {order.paymentStatus || badge.label}
                  </span>
                </span>
              </motion.li>
            );
          })}
        </ul>
      </PanelState>
    </PanelShell>
  );
}
