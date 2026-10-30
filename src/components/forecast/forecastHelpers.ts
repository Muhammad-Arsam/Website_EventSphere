// Pure helper functions for the Demand Forecast page (no React in here).

import type {
  DailySales,
  DemandForecast,
  ForecastReplay,
  ReplayTier,
  TierPrediction,
} from '@/types/analytics.types';
import type { EventResponse } from '@/types/event.types';
import type { Tone } from './forecastTheme';

/* ───────────── Dates ─────────────
   The API sends plain "YYYY-MM-DD" strings. new Date("2026-10-30") is read as UTC
   and can show the wrong day in some time zones, so we always work in UTC. */

export const toTimestamp = (iso: string): number => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return Date.UTC(y, (m || 1) - 1, d || 1);
};

const longDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});
const shortDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', timeZone: 'UTC',
});

export const formatDate = (iso?: string | null): string =>
  iso ? longDate.format(toTimestamp(iso)) : '—';

export const formatShortDate = (iso?: string | null): string =>
  iso ? shortDate.format(toTimestamp(iso)) : '—';

export const daysBetween = (fromIso: string, toIso: string): number =>
  Math.round((toTimestamp(toIso) - toTimestamp(fromIso)) / 86_400_000);

/* ───────────── Numbers ───────────── */

export const formatInt = (n: number): string =>
  Number.isFinite(n) ? Math.round(n).toLocaleString('en-US') : '—';

export const formatRs = (n: number): string =>
  Number.isFinite(n) ? `Rs. ${Math.round(n).toLocaleString('en-US')}` : '—';

// Takes a PERCENT value (19.46 → "19.5%"). The API mixes units:
//  - projectedSellThrough and sellOutProbability are fractions (0.22)
//  - *Percent fields and *PercentagePoints fields are already percents (19.46)
export const formatPct = (percent: number): string =>
  Number.isFinite(percent) ? `${Number(percent.toFixed(1))}%` : '—';

export const fractionToPct = (fraction: number): string => formatPct(fraction * 100);

export const clamp01 = (n: number): number =>
  Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;

export const prettify = (value?: string | null): string => {
  if (!value) return '';
  const text = value.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/* ───────────── View type / phase / status labels ─────────────
   Seen so far: viewType FORECAST | LIVE | BACKTEST, eventPhase IN_PROGRESS | COMPLETED,
   status SLOW. Anything else falls back to a neutral label so the page never breaks. */

export type ViewKind = 'forecast' | 'live' | 'backtest' | 'other';

export interface ViewMeta {
  kind: ViewKind;
  label: string;
  description: string;
  tone: Tone;
}

export const getViewMeta = (viewType: string): ViewMeta => {
  switch ((viewType || '').toUpperCase()) {
    case 'FORECAST':
      return { kind: 'forecast', label: 'Upcoming forecast', tone: 'violet',
        description: 'Projected ticket sales from today until the event date.' };
    case 'LIVE':
      return { kind: 'live', label: 'Live event', tone: 'brand',
        description: 'The event is underway: sales so far plus a short projection.' };
    case 'BACKTEST':
      return { kind: 'backtest', label: 'Backtest replay', tone: 'sky',
        description: 'A retrospective replay: what the model would have predicted before the event ended.' };
    default:
      return { kind: 'other', label: prettify(viewType) || 'Forecast', tone: 'gray',
        description: 'Demand forecast for this event.' };
  }
};

export const getPhaseMeta = (phase?: string | null): { label: string; title: string } => {
  switch ((phase || '').toUpperCase()) {
    case 'IN_PROGRESS': return { label: 'In progress', title: 'Sales so far' };
    case 'COMPLETED': return { label: 'Completed', title: 'Final results' };
    default: return { label: prettify(phase) || 'Unknown', title: 'Sales history' };
  }
};

export const getStatusMeta = (status: string): { label: string; tone: Tone } => {
  if ((status || '').toUpperCase() === 'SLOW') return { label: 'Behind pace', tone: 'amber' };
  return { label: prettify(status) || 'Unknown', tone: 'gray' };
};

// A finished event does not need advice like "improve promotion".
export const showRecommendations = (viewType: string): boolean =>
  (viewType || '').toUpperCase() !== 'BACKTEST';

export const getEventStatusTone = (status: string): Tone => {
  switch ((status || '').toUpperCase()) {
    case 'PUBLISHED': return 'brand';
    case 'DRAFT': return 'amber';
    case 'COMPLETED': return 'sky';
    default: return 'gray';
  }
};

/* ───────────── Totals and KPI cards ───────────── */

export interface ForecastTotals {
  capacity: number;
  sold: number;
  projected: number;
  naive: number;
  soldPct: number; // percent 0-100
  projectedPct: number; // percent 0-100
  projectedRevenue: number; // projectedSold x current price, summed over tiers
}

export const getTotals = (predictions: TierPrediction[]): ForecastTotals => {
  const sum = (pick: (t: TierPrediction) => number) =>
    predictions.reduce((acc, t) => acc + pick(t), 0);

  const capacity = sum((t) => t.capacity);
  const sold = sum((t) => t.sold);
  const projected = sum((t) => t.projectedSold);

  return {
    capacity,
    sold,
    projected,
    naive: sum((t) => t.naiveProjectedSold),
    soldPct: capacity ? (sold / capacity) * 100 : 0,
    projectedPct: capacity ? (projected / capacity) * 100 : 0,
    projectedRevenue: sum((t) => t.projectedSold * t.price),
  };
};

export type KpiKind = 'int' | 'percent' | 'money';
export type KpiIcon = 'ticket' | 'target' | 'gauge' | 'wallet' | 'check';

export interface Kpi {
  id: string;
  label: string;
  value: number;
  kind: KpiKind;
  caption: string;
  tone: Tone;
  icon: KpiIcon;
}

export const buildKpis = (f: DemandForecast): Kpi[] => {
  const t = getTotals(f.predictions);
  const isBacktest = getViewMeta(f.viewType).kind === 'backtest';

  const kpis: Kpi[] = [
    {
      id: 'sold',
      label: isBacktest ? 'Sold at forecast date' : 'Sold so far',
      value: t.sold,
      kind: 'int',
      caption: `of ${formatInt(t.capacity)} capacity · ${formatPct(t.soldPct)}`,
      tone: 'brand',
      icon: 'ticket',
    },
    {
      id: 'projected',
      label: 'Model projection',
      value: t.projected,
      kind: 'int',
      caption: `Naive baseline: ${formatInt(t.naive)}`,
      tone: 'violet',
      icon: 'target',
    },
    {
      id: 'sellthrough',
      label: 'Projected sell-through',
      value: t.projectedPct,
      kind: 'percent',
      caption: 'of total capacity',
      tone: 'amber',
      icon: 'gauge',
    },
  ];

  if (isBacktest && f.historical) {
    kpis.push({
      id: 'actual',
      label: 'Actually sold',
      value: f.historical.totalTicketsSold,
      kind: 'int',
      caption: `Model said ${formatInt(t.projected)}`,
      tone: 'sky',
      icon: 'check',
    });
  } else {
    kpis.push({
      id: 'revenue',
      label: 'Projected ticket value',
      value: t.projectedRevenue,
      kind: 'money',
      caption: 'At current ticket prices',
      tone: 'rose',
      icon: 'wallet',
    });
  }

  return kpis;
};

/* ───────────── Chart data ─────────────
   IMPORTANT: every "sold" value in actualSales / projection is CUMULATIVE
   (total sold up to that date), not tickets sold on that day. */

export interface ChartPoint { x: number; y: number }

export interface TrajectoryData {
  actual: ChartPoint[];
  model: ChartPoint[];
  naive: ChartPoint[];
  outcome: ChartPoint[]; // backtest only: what really happened after the forecast date
  capacity: number;
  asOfTs: number;
  eventTs: number;
}

const toPoints = (rows: DailySales[]): ChartPoint[] =>
  rows.map((r) => ({ x: toTimestamp(r.date), y: r.sold }));

export const buildTrajectory = (f: DemandForecast, tier: TierPrediction): TrajectoryData => {
  const asOfTs = toTimestamp(f.asOf);
  const eventTs = toTimestamp(f.eventDate);

  let outcome: ChartPoint[] = [];
  if (getViewMeta(f.viewType).kind === 'backtest') {
    const real = f.historical?.tiers.find((h) => h.tierId === tier.tierId);
    if (real) outcome = toPoints(real.actualSales).filter((p) => p.x >= asOfTs);
  }

  return {
    actual: toPoints(tier.actualSales),
    model: toPoints(tier.projection),
    naive: [
      { x: asOfTs, y: tier.sold },
      { x: eventTs, y: tier.naiveProjectedSold },
    ],
    outcome,
    capacity: tier.capacity,
    asOfTs,
    eventTs,
  };
};

/* ───────────── Backtest replay ───────────── */

export type ReplayVerdict = 'model' | 'naive' | 'tie';

export const getReplayVerdict = (replay: ForecastReplay): ReplayVerdict => {
  const model = replay.modelMeanAbsoluteErrorTickets;
  const naive = replay.naiveMeanAbsoluteErrorTickets;
  if (Math.abs(model - naive) < 0.005) return 'tie';
  return model < naive ? 'model' : 'naive';
};

export const findReplayTier = (
  replay: ForecastReplay | null | undefined,
  tierId: string
): ReplayTier | undefined => replay?.tiers.find((t) => t.tierId === tierId);

/* ───────────── Events list ───────────── */

const safeTime = (value?: string): number => {
  const t = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
};

// Upcoming / ongoing events first (soonest first), then past events (newest first).
export const sortEventsForForecast = (events: EventResponse[], now = Date.now()): EventResponse[] => {
  const start = (e: EventResponse) => safeTime(e.startDateTime);
  const end = (e: EventResponse) => safeTime(e.endDateTime) || start(e);

  const upcoming = events.filter((e) => end(e) >= now).sort((a, b) => start(a) - start(b));
  const past = events.filter((e) => end(e) < now).sort((a, b) => start(b) - start(a));
  return [...upcoming, ...past];
};

export const formatEventDate = (value?: string): string => {
  const t = safeTime(value);
  return t
    ? new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
};
