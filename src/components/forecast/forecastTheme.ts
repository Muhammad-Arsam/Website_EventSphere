// Colors and shared class names for the Demand Forecast page.
// Tailwind only sees full class names, so every class below is written out in full.

export type Tone = 'brand' | 'violet' | 'amber' | 'sky' | 'rose' | 'gray';

export interface ToneStyle {
  chip: string; // small pill: background + text + ring
  text: string; // accent text color
  icon: string; // round icon bubble
  bar: string; // solid bar fill
  dot: string; // small status dot
}

export const TONES: Record<Tone, ToneStyle> = {
  brand: {
    chip: 'bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-500/30',
    text: 'text-brand-600 dark:text-brand-300',
    icon: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
    bar: 'bg-brand-500',
    dot: 'bg-brand-500',
  },
  violet: {
    chip: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30',
    text: 'text-violet-600 dark:text-violet-300',
    icon: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
    bar: 'bg-violet-500',
    dot: 'bg-violet-500',
  },
  amber: {
    chip: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
    text: 'text-amber-600 dark:text-amber-300',
    icon: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    bar: 'bg-amber-500',
    dot: 'bg-amber-500',
  },
  sky: {
    chip: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30',
    text: 'text-sky-600 dark:text-sky-300',
    icon: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
    bar: 'bg-sky-500',
    dot: 'bg-sky-500',
  },
  rose: {
    chip: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30',
    text: 'text-rose-600 dark:text-rose-300',
    icon: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
    bar: 'bg-rose-500',
    dot: 'bg-rose-500',
  },
  gray: {
    chip: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-white/10 dark:text-gray-300 dark:ring-white/15',
    text: 'text-gray-600 dark:text-gray-300',
    icon: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300',
    bar: 'bg-gray-400',
    dot: 'bg-gray-400',
  },
};

// Chart colors (hex, because ApexCharts needs real color values)
export const CHART_COLORS = {
  actual: '#2FA084', // brand green: tickets really sold
  model: '#7a5af8', // violet: the model's projection
  naive: '#f79009', // amber: the simple baseline
  outcome: '#0ba5ec', // sky: what really happened (backtest only)
  capacity: '#98a2b3', // gray: capacity line
};

// Shared card look (same style as the dashboard cards)
export const CARD =
  'rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/3';
