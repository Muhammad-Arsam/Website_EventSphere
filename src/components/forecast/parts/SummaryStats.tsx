'use client';

import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Gauge, Target, Ticket, Wallet } from 'lucide-react';
import type { DemandForecast } from '@/types/analytics.types';
import { buildKpis, formatPct, type KpiIcon, type KpiKind } from '../forecastHelpers';
import { KpiCard } from '../forecastPanels';

const ICONS: Record<KpiIcon, LucideIcon> = {
  ticket: Ticket,
  target: Target,
  gauge: Gauge,
  wallet: Wallet,
  check: CheckCircle2,
};

// Shown with a spinner while the forecast is loading (the real labels depend on the view type).
const PLACEHOLDERS = [
  { id: 'sold', label: 'Sold so far', caption: 'Tickets sold', icon: 'ticket' as KpiIcon },
  { id: 'projected', label: 'Model projection', caption: 'Expected by the target date', icon: 'target' as KpiIcon },
  { id: 'sellthrough', label: 'Projected sell-through', caption: 'Of total capacity', icon: 'gauge' as KpiIcon },
  { id: 'revenue', label: 'Projected ticket value', caption: 'At current ticket prices', icon: 'wallet' as KpiIcon },
];

const FORMAT: Partial<Record<KpiKind, (n: number) => string>> = { percent: formatPct };

// The same colored KPI cards as the dashboard. `forecast = null` means "still loading".
export default function SummaryStats({ forecast }: { forecast: DemandForecast | null }) {
  const cards = forecast
    ? buildKpis(forecast).map((k) => ({
        id: k.id, label: k.label, caption: k.caption, icon: k.icon, value: k.value as number | null, kind: k.kind,
      }))
    : PLACEHOLDERS.map((k) => ({ ...k, value: null as number | null, kind: 'int' as KpiKind }));

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <KpiCard
          key={card.id}
          label={card.label}
          caption={card.caption}
          icon={ICONS[card.icon]}
          value={card.value}
          format={FORMAT[card.kind]}
          prefix={card.kind === 'money' ? 'Rs.' : undefined}
          index={i}
        />
      ))}
    </div>
  );
}
