import { ORDER_BADGE } from './workspaceShared';

// Colors for the My Organization page (full class names, so Tailwind can see them).
// They reuse the same badge colors as the dashboard: green = money in / active, rose = money out / problem.

export type TransactionKind = 'credit' | 'debit' | 'other';

export const TXN_STYLE: Record<TransactionKind, {
  label: string; sign: string; amount: string; bubble: string; chip: string;
}> = {
  credit: {
    label: 'Credit',
    sign: '+',
    amount: 'text-emerald-300',
    bubble: 'bg-emerald-400/15 text-emerald-300 ring-emerald-300/25',
    chip: ORDER_BADGE.paid.chipOnDark,
  },
  debit: {
    label: 'Debit',
    sign: '-',
    amount: 'text-rose-300',
    bubble: 'bg-rose-400/15 text-rose-300 ring-rose-300/25',
    chip: ORDER_BADGE.failed.chipOnDark,
  },
  other: {
    label: 'Other',
    sign: '',
    amount: 'text-white',
    bubble: 'bg-white/10 text-white/80 ring-white/20',
    chip: ORDER_BADGE.other.chipOnDark,
  },
};

// Hero chip (on the deep green hero): status dot + chip colors
export const HERO_STATUS = {
  active: { dot: 'bg-brand-300', chip: 'bg-white/12 text-white ring-white/25' },
  warning: { dot: 'bg-amber-300', chip: 'bg-amber-400/15 text-amber-100 ring-amber-300/30' },
};
