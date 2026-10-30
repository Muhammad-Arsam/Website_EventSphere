import { History, Radio, Sparkles, LineChart } from 'lucide-react';
import { getViewMeta, type ViewKind } from '../forecastHelpers';

const ICONS: Record<ViewKind, typeof Sparkles> = {
  forecast: Sparkles,
  live: Radio,
  backtest: History,
  other: LineChart,
};

// Glass-style badge for the dark hero. A pulsing dot is shown for live events.
export default function ViewTypeBadge({ viewType }: { viewType: string }) {
  const meta = getViewMeta(viewType);
  const Icon = ICONS[meta.kind];

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-md">
      {meta.kind === 'live' ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-300 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-300" />
        </span>
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
      {meta.label}
    </span>
  );
}
