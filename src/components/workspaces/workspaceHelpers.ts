import type { WalletTransaction } from '@/types/organization.types';
import type { OrderBucket } from './workspaceShared';
import type { TransactionKind } from './workspaceTheme';

/* ───────────── Dates ───────────── */

const toTime = (iso?: string | null): number => {
  const t = iso ? new Date(iso).getTime() : NaN;
  return Number.isFinite(t) ? t : NaN;
};

const dateOnly = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTime = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
});

export const formatDate = (iso?: string | null): string => {
  const t = toTime(iso);
  return Number.isNaN(t) ? '—' : dateOnly.format(t);
};

export const formatDateTime = (iso?: string | null): string => {
  const t = toTime(iso);
  return Number.isNaN(t) ? '—' : dateTime.format(t);
};

/* ───────────── Subscription ───────────── */

export interface RenewalInfo {
  date: string;   // "12 Nov 2026"
  hint: string;   // "in 23 days"
  kind: 'ok' | 'soon' | 'expired' | 'none';
}

export const getRenewalInfo = (iso?: string | null, now = Date.now()): RenewalInfo => {
  const t = toTime(iso);
  if (Number.isNaN(t)) return { date: 'No active subscription', hint: '', kind: 'none' };

  const days = Math.ceil((t - now) / 86_400_000);
  if (days < 0) {
    const ago = Math.abs(days);
    return { date: formatDate(iso), hint: `Expired ${ago} ${ago === 1 ? 'day' : 'days'} ago`, kind: 'expired' };
  }
  if (days === 0) return { date: formatDate(iso), hint: 'Renews today', kind: 'soon' };
  return {
    date: formatDate(iso),
    hint: `in ${days} ${days === 1 ? 'day' : 'days'}`,
    kind: days <= 14 ? 'soon' : 'ok',
  };
};

// Maps a status text from the API to one of the dashboard badge colors.
export const getStatusBucket = (status?: string | null): OrderBucket => {
  const s = (status ?? '').toUpperCase();
  if (s === 'ACTIVE' || s === 'TRIAL') return 'paid';
  if (['EXPIRED', 'CANCELLED', 'CANCELED', 'INACTIVE', 'SUSPENDED', 'BLOCKED'].includes(s)) return 'failed';
  if (s === 'PENDING') return 'pending';
  return 'other';
};

/* ───────────── Transactions ───────────── */

export const getTransactionKind = (type?: string | null): TransactionKind => {
  const t = (type ?? '').toUpperCase();
  if (t === 'CREDIT') return 'credit';
  if (t === 'DEBIT') return 'debit';
  return 'other';
};

// Newest first (the API order is not guaranteed)
export const sortTransactions = (list: WalletTransaction[]): WalletTransaction[] =>
  [...list].sort((a, b) => (toTime(b.createdAt) || 0) - (toTime(a.createdAt) || 0));

export interface TransactionTotals {
  credits: number;
  debits: number;
  creditCount: number;
  debitCount: number;
}

export const getTransactionTotals = (list: WalletTransaction[]): TransactionTotals =>
  list.reduce<TransactionTotals>(
    (acc, txn) => {
      const kind = getTransactionKind(txn.transactionType);
      const amount = Math.abs(Number(txn.amount) || 0);
      if (kind === 'credit') { acc.credits += amount; acc.creditCount += 1; }
      if (kind === 'debit') { acc.debits += amount; acc.debitCount += 1; }
      return acc;
    },
    { credits: 0, debits: 0, creditCount: 0, debitCount: 0 }
  );

export const pluralize = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`;
