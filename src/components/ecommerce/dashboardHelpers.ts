// Pure helper functions for the dashboard (no React in here).
// Everything is calculated from real API data: analytics, orders and tickets.

import type { EventAnalytics } from '@/types/analytics.types';
import type { AttendeeTicket, EventOrder, EventResponse } from '@/types/event.types';
import type { OrderBucket } from './dashboardTheme';
import { formatEventDate, formatRs } from './dashboardShared';

const DAY_MS = 86_400_000;

/* ───────────── Rates from the analytics API ───────────── */

export interface EventRates {
  unsold: number;
  occupancy: number; // percent 0-100 (tickets sold / capacity)
  checkIn: number; // percent 0-100 (checked in / tickets sold)
  checkedInOfCapacity: number; // percent 0-100
  revenuePerTicket: number;
}

export const getRates = (a: EventAnalytics): EventRates => ({
  unsold: Math.max(a.totalCapacity - a.totalTicketsSold, 0),
  occupancy: a.totalCapacity ? (a.totalTicketsSold / a.totalCapacity) * 100 : 0,
  checkIn: a.totalTicketsSold ? (a.totalCheckedIn / a.totalTicketsSold) * 100 : 0,
  checkedInOfCapacity: a.totalCapacity ? (a.totalCheckedIn / a.totalCapacity) * 100 : 0,
  revenuePerTicket: a.totalTicketsSold ? a.totalRevenue / a.totalTicketsSold : 0,
});

/* ───────────── Event timing (from the event's own dates) ───────────── */

export type EventTimingKind = 'upcoming' | 'live' | 'ended' | 'unknown';

const toTime = (value?: string): number => {
  const t = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export const getEventTiming = (
  event: EventResponse | null,
  now = Date.now()
): { kind: EventTimingKind; label: string } => {
  if (!event) return { kind: 'unknown', label: '' };
  const start = toTime(event.startDateTime);
  const end = toTime(event.endDateTime) || start;
  if (!start) return { kind: 'unknown', label: '' };

  if (now < start) {
    const days = Math.ceil((start - now) / DAY_MS);
    return { kind: 'upcoming', label: days <= 1 ? 'Starts within a day' : `Starts in ${plural(days, 'day')}` };
  }
  if (now <= end) return { kind: 'live', label: 'Happening now' };

  const days = Math.floor((now - end) / DAY_MS);
  return { kind: 'ended', label: days < 1 ? 'Ended today' : `Ended ${plural(days, 'day')} ago` };
};

export const formatEventRange = (event: EventResponse | null): string => {
  if (!event) return '';
  const start = formatEventDate(event.startDateTime);
  const end = formatEventDate(event.endDateTime);
  return start === end || end === '—' ? start : `${start} – ${end}`;
};

export const formatLocation = (event: EventResponse | null): string =>
  [event?.venue, event?.city].filter(Boolean).join(', ');

/* ───────────── Orders ───────────── */

// Status values already used in EventOrdersTable: PAID, SUCCESS, PENDING, FAILED.
export const getOrderBucket = (status?: string): OrderBucket => {
  switch ((status ?? '').toUpperCase()) {
    case 'PAID':
    case 'SUCCESS': return 'paid';
    case 'PENDING': return 'pending';
    case 'FAILED': return 'failed';
    default: return 'other';
  }
};

export interface OrderStats {
  total: number;
  counts: Record<OrderBucket, number>;
  paidRevenue: number;
  averageOrderValue: number;
}

export const getOrderStats = (orders: EventOrder[]): OrderStats => {
  const counts: Record<OrderBucket, number> = { paid: 0, pending: 0, failed: 0, other: 0 };
  let paidRevenue = 0;
  for (const order of orders) {
    const bucket = getOrderBucket(order.paymentStatus);
    counts[bucket] += 1;
    if (bucket === 'paid') paidRevenue += order.totalAmount;
  }
  return {
    total: orders.length,
    counts,
    paidRevenue,
    averageOrderValue: counts.paid ? paidRevenue / counts.paid : 0,
  };
};

export const getRecentOrders = (orders: EventOrder[], limit = 6): EventOrder[] =>
  [...orders]
    .sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt))
    .slice(0, limit);

export interface RevenuePoint {
  x: number; // local midnight (timestamp)
  daily: number;
  cumulative: number;
}

// Real revenue per day, from PAID / SUCCESS orders only.
export const buildRevenueSeries = (orders: EventOrder[]): RevenuePoint[] => {
  const perDay = new Map<number, number>();
  for (const order of orders) {
    if (getOrderBucket(order.paymentStatus) !== 'paid') continue;
    const t = toTime(order.createdAt);
    if (!t) continue;
    const d = new Date(t);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    perDay.set(day, (perDay.get(day) ?? 0) + order.totalAmount);
  }

  let running = 0;
  return [...perDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([x, daily]) => {
      running += daily;
      return { x, daily, cumulative: running };
    });
};

export type BucketUnit = 'day' | 'week' | 'month';

export interface RevenueBucket {
  label: string; // short label under the bar
  tooltip: string; // full label in the tooltip
  revenue: number;
  orders: number;
}

export interface RevenueBuckets {
  unit: BucketUnit;
  buckets: RevenueBucket[];
}

const startOfDay = (t: number) => {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};
const startOfWeek = (t: number) => {
  const d = new Date(startOfDay(t));
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return d.getTime();
};
const startOfMonth = (t: number) => {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
};
const addUnit = (t: number, unit: BucketUnit) => {
  const d = new Date(t);
  if (unit === 'day') d.setDate(d.getDate() + 1);
  else if (unit === 'week') d.setDate(d.getDate() + 7);
  else d.setMonth(d.getMonth() + 1);
  return d.getTime();
};

const fmt = (t: number, opts: Intl.DateTimeFormatOptions) => new Date(t).toLocaleDateString('en-GB', opts);

// Groups PAID orders into evenly spaced bars. The bar size depends on how long the sales period is
// (days up to a month, weeks up to ~6 months, months after that), so bars never become hairlines.
export const buildRevenueBuckets = (orders: EventOrder[]): RevenueBuckets => {
  const paid = orders
    .filter((o) => getOrderBucket(o.paymentStatus) === 'paid' && toTime(o.createdAt))
    .map((o) => ({ t: toTime(o.createdAt), amount: o.totalAmount }));
  if (paid.length === 0) return { unit: 'day', buckets: [] };

  const first = Math.min(...paid.map((p) => p.t));
  const last = Math.max(...paid.map((p) => p.t));
  const spanDays = (last - first) / DAY_MS;
  const unit: BucketUnit = spanDays <= 31 ? 'day' : spanDays <= 180 ? 'week' : 'month';
  const startOf = unit === 'day' ? startOfDay : unit === 'week' ? startOfWeek : startOfMonth;

  const sums = new Map<number, { revenue: number; orders: number }>();
  for (const p of paid) {
    const key = startOf(p.t);
    const cur = sums.get(key) ?? { revenue: 0, orders: 0 };
    cur.revenue += p.amount;
    cur.orders += 1;
    sums.set(key, cur);
  }

  const buckets: RevenueBucket[] = [];
  for (let t = startOf(first); t <= startOf(last); t = addUnit(t, unit)) {
    const v = sums.get(t) ?? { revenue: 0, orders: 0 };
    buckets.push({
      label: unit === 'month' ? fmt(t, { month: 'short', year: '2-digit' }) : fmt(t, { day: 'numeric', month: 'short' }),
      tooltip:
        unit === 'day' ? fmt(t, { day: 'numeric', month: 'short', year: 'numeric' })
        : unit === 'week' ? `Week of ${fmt(t, { day: 'numeric', month: 'short' })}`
        : fmt(t, { month: 'long', year: 'numeric' }),
      ...v,
    });
  }
  return { unit, buckets };
};

export const getBestDay = (points: RevenuePoint[]): RevenuePoint | null =>
  points.reduce<RevenuePoint | null>((best, p) => (!best || p.daily > best.daily ? p : best), null);

/* ───────────── Tickets ───────────── */

// Same rule as TicketsList: use `checkedIn`, fall back to the old status text.
export const isTicketCheckedIn = (t: AttendeeTicket): boolean =>
  t.checkedIn ?? t.ticketStatus === 'checked_in';

export interface TierRow {
  name: string;
  total: number;
  checkedIn: number;
}

export const groupTicketsByTier = (tickets: AttendeeTicket[]): TierRow[] => {
  const tiers = new Map<string, TierRow>();
  for (const ticket of tickets) {
    const name = ticket.tierName || 'Unknown tier';
    const row = tiers.get(name) ?? { name, total: 0, checkedIn: 0 };
    row.total += 1;
    if (isTicketCheckedIn(ticket)) row.checkedIn += 1;
    tiers.set(name, row);
  }
  return [...tiers.values()].sort((a, b) => b.total - a.total);
};

/* ───────────── Small formatters ───────────── */

export const formatCompactRs = (n: number): string => {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1_000_000) return `Rs. ${Number((n / 1_000_000).toFixed(1))}M`;
  if (Math.abs(n) >= 1_000) return `Rs. ${Number((n / 1_000).toFixed(1))}k`;
  return formatRs(n);
};

export const formatCompactNumber = (n: number): string => {
  if (!Number.isFinite(n)) return '';
  if (Math.abs(n) >= 1_000_000) return `${Number((n / 1_000_000).toFixed(1))}M`;
  if (Math.abs(n) >= 1_000) return `${Number((n / 1_000).toFixed(1))}k`;
  return String(Math.round(n));
};

export const timeAgo = (iso: string, now = Date.now()): string => {
  const t = toTime(iso);
  if (!t) return '';
  const minutes = Math.floor((now - t) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} d ago`;
  return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const initialOf = (name?: string): string => (name?.trim().charAt(0) || '?').toUpperCase();
