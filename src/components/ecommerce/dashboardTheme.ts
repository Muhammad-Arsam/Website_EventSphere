// Colors used by the dashboard (full class names, so Tailwind can see them).
// Every color comes from the brand palette in globals.css (brand-25 ... brand-950).

export type PanelTone = 'forest' | 'mint';

// Two card styles used all over the dashboard:
//  - forest: deep green gradient, light text (same family as the hero)
//  - mint:   soft green tint, dark text
export const PANEL: Record<PanelTone, {
  card: string; title: string; subtitle: string; strong: string; body: string; muted: string;
  tile: string; track: string; divider: string; accent: string;
}> = {
  forest: {
    card: 'relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-950 via-brand-900 to-brand-800 text-white shadow-lg shadow-brand-950/25 ring-1 ring-white/10',
    title: 'text-white',
    subtitle: 'text-white/65',
    strong: 'text-white',
    body: 'text-white/80',
    muted: 'text-white/60',
    tile: 'bg-white/10 ring-1 ring-white/10',
    track: 'bg-white/10',
    divider: 'border-white/10',
    accent: 'text-brand-300',
  },
  mint: {
    card: 'relative overflow-hidden rounded-3xl border border-brand-200/70 bg-linear-to-br from-brand-25 via-brand-50 to-brand-100 shadow-sm dark:border-brand-500/20 dark:from-brand-900/60 dark:via-brand-950/70 dark:to-brand-900/50',
    title: 'text-gray-900 dark:text-white',
    subtitle: 'text-gray-600 dark:text-gray-400',
    strong: 'text-gray-900 dark:text-white',
    body: 'text-gray-700 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    tile: 'bg-white/70 ring-1 ring-brand-100 dark:bg-white/5 dark:ring-white/10',
    track: 'bg-white/80 dark:bg-white/10',
    divider: 'border-brand-200/70 dark:border-white/10',
    accent: 'text-brand-600 dark:text-brand-300',
  },
};

// KPI card backgrounds: five shades from the brand palette
export const KPI_GRADIENTS = [
  'from-brand-950 via-brand-800 to-brand-700',
  'from-brand-900 via-brand-700 to-brand-500',
  'from-brand-800 via-brand-600 to-brand-400',
  'from-brand-950 via-brand-900 to-brand-600',
  'from-brand-900 via-brand-800 to-brand-500',
];

// Hex values for charts (ApexCharts needs real colors). Same values as the palette.
export const DASH_COLORS = {
  brand300: '#6FCF97',
  brand400: '#4dba9f',
  brand500: '#2FA084',
  brand700: '#1F6F5F',
  amber: '#f79009',
  amberLight: '#fdb022',
  unsoldOnDark: 'rgba(255,255,255,0.16)',
};

export type OrderBucket = 'paid' | 'pending' | 'failed' | 'other';

export const ORDER_BADGE: Record<OrderBucket, { label: string; chip: string; chipOnDark: string; dot: string }> = {
  paid: {
    label: 'Paid',
    chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
    chipOnDark: 'bg-emerald-400/15 text-emerald-200 ring-emerald-300/30',
    dot: 'bg-emerald-400',
  },
  pending: {
    label: 'Pending',
    chip: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
    chipOnDark: 'bg-amber-400/15 text-amber-200 ring-amber-300/30',
    dot: 'bg-amber-400',
  },
  failed: {
    label: 'Failed',
    chip: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30',
    chipOnDark: 'bg-rose-400/15 text-rose-200 ring-rose-300/30',
    dot: 'bg-rose-400',
  },
  other: {
    label: 'Other',
    chip: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-white/10 dark:text-gray-300 dark:ring-white/15',
    chipOnDark: 'bg-white/10 text-white/80 ring-white/20',
    dot: 'bg-gray-400',
  },
};
