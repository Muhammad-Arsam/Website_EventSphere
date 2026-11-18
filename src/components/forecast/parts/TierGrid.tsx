'use client';

import type { DemandForecast } from '@/types/analytics.types';
import { findReplayTier, showRecommendations } from '../forecastHelpers';
import TierCard from './TierCard';

interface Props {
  forecast: DemandForecast;
  activeTierId: string;
  onSelectTier: (tierId: string) => void;
}

export default function TierGrid({ forecast, activeTierId, onSelectTier }: Props) {
  const withAdvice = showRecommendations(forecast.viewType);

  return (
    <section>
      <div className="mb-5">
        <h3 className="text-lg font-bold tracking-tight text-brand-950 dark:text-white">Ticket tiers</h3>
        <p className="mt-0.5 text-sm font-medium text-brand-950 dark:text-white/75">
          Select a tier to see its sales curve in the chart below.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {forecast.predictions.map((tier, index) => (
          <TierCard
            key={tier.tierId}
            tier={tier}
            index={index}
            selected={tier.tierId === activeTierId}
            onSelect={() => onSelectTier(tier.tierId)}
            showRecommendation={withAdvice}
            replayTier={findReplayTier(forecast.replay, tier.tierId)}
          />
        ))}
      </div>
    </section>
  );
}
