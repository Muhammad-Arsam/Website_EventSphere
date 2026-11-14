'use client';

import { CheckCircle2, Clock3, Ticket, Users, Wallet } from 'lucide-react';
import type { EventAnalytics } from '@/types/analytics.types';
import KpiCard from './KpiCard';

// `analytics` is null while it loads: the cards show a shimmer instead of a number.
export default function KpiGrid({ analytics }: { analytics: EventAnalytics | null }) {
  const cards = [
    { label: 'Total Revenue', caption: 'From ticket sales', icon: Wallet, value: analytics?.totalRevenue, prefix: 'Rs.' },
    { label: 'Tickets Sold', caption: 'Confirmed purchases', icon: Ticket, value: analytics?.totalTicketsSold },
    { label: 'Total Capacity', caption: 'Max attendees', icon: Users, value: analytics?.totalCapacity },
    { label: 'Checked In', caption: 'Arrived at venue', icon: CheckCircle2, value: analytics?.totalCheckedIn },
    { label: 'Pending Entry', caption: 'Yet to check in', icon: Clock3, value: analytics?.totalPendingEntry },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card, i) => (
        <KpiCard
          key={card.label}
          label={card.label}
          caption={card.caption}
          icon={card.icon}
          value={card.value ?? null}
          prefix={card.prefix}
          index={i}
        />
      ))}
    </div>
  );
}
