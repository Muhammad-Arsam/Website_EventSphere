import type { ReactNode } from 'react';
import { AlertTriangle, Inbox } from 'lucide-react';
import type { PanelTone } from '../dashboardTheme';

interface Props {
  tone?: PanelTone;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyTitle: string;
  emptyText: string;
  height?: number; // placeholder height while loading
  children: ReactNode;
}

const STYLES = {
  forest: {
    loading: 'bg-white/10',
    error: 'bg-rose-400/15 text-rose-100',
    box: 'border-white/20',
    bubble: 'bg-white/10 text-brand-300',
    title: 'text-white',
    text: 'text-white/65',
  },
  mint: {
    loading: 'bg-white/70 dark:bg-white/5',
    error: 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400',
    box: 'border-brand-200 dark:border-white/15',
    bubble: 'bg-white/80 text-brand-500 dark:bg-brand-500/15 dark:text-brand-300',
    title: 'text-gray-900 dark:text-white',
    text: 'text-gray-600 dark:text-gray-400',
  },
};

// Shows a loading placeholder, an error or an empty message INSIDE a card.
// Used for data that loads on its own (orders, tickets), so one failure never breaks the page.
export default function PanelState({ tone = 'mint', loading, error, isEmpty, emptyTitle, emptyText, height = 240, children }: Props) {
  const s = STYLES[tone];

  if (loading) {
    return <div className={`animate-pulse rounded-2xl ${s.loading}`} style={{ height }} aria-busy="true" />;
  }

  if (error) {
    return (
      <div role="alert" className={`flex items-start gap-3 rounded-2xl p-4 text-sm ${s.error}`}>
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center ${s.box}`} style={{ minHeight: height }}>
        <span className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${s.bubble}`}>
          <Inbox className="h-6 w-6" />
        </span>
        <p className={`font-semibold ${s.title}`}>{emptyTitle}</p>
        <p className={`mt-1 max-w-xs text-sm ${s.text}`}>{emptyText}</p>
      </div>
    );
  }

  return <>{children}</>;
}
