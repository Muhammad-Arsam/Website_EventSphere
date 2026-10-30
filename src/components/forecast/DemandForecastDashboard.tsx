'use client';

import { useState } from 'react';
import { useDemandForecast } from './parts/useDemandForecast';
import { getViewMeta } from './forecastHelpers';
import ForecastHero from './parts/ForecastHero';
import ForecastMessage from './parts/ForecastMessage';
import ForecastSkeleton from './parts/ForecastSkeleton';
import HistoricalPanel from './parts/HistoricalPanel';
import ModelTransparency from './parts/ModelTransparency';
import ReplayPanel from './parts/ReplayPanel';
import Reveal from './parts/Reveal';
import SummaryStats from './parts/SummaryStats';
import SyntheticDataBanner from './parts/SyntheticDataBanner';
import TierGrid from './parts/TierGrid';
import TrajectoryChart from './parts/TrajectoryChart';

// The page frame: loads the data and decides which sections to show.
// Same idea as EventChatbot.tsx: this file only connects the parts.
export default function DemandForecastDashboard() {
  const {
    events, eventsLoading, eventsError, selectedEventId, selectedEvent, selectEvent,
    forecast, forecastLoading, forecastError, reload,
  } = useDemandForecast();

  const [chosenTierId, setChosenTierId] = useState('');

  // ── Events are loading ──
  if (eventsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-52 animate-pulse rounded-3xl bg-gray-200 dark:bg-white/5" />
        <ForecastSkeleton />
      </div>
    );
  }

  // ── Could not load events ──
  if (eventsError) {
    return <ForecastMessage variant="error" title="Could not load your events" text={eventsError} />;
  }

  // ── No events yet ──
  if (events.length === 0) {
    return (
      <ForecastMessage
        variant="empty"
        title="No published events"
        text="Publish an event with ticket tiers to see its demand forecast here."
      />
    );
  }

  const tiers = forecast?.predictions ?? [];
  // If the chosen tier does not exist in this event, fall back to the first tier.
  const activeTierId = tiers.find((t) => t.tierId === chosenTierId)?.tierId ?? tiers[0]?.tierId ?? '';
  const viewKind = forecast ? getViewMeta(forecast.viewType).kind : 'other';

  return (
    <div className="space-y-6 pb-20">
      <ForecastHero
        events={events}
        selectedEvent={selectedEvent}
        selectedEventId={selectedEventId}
        onSelect={selectEvent}
        forecast={forecast}
        loading={forecastLoading}
        onReload={reload}
      />

      {forecastLoading && <ForecastSkeleton />}

      {forecastError && !forecastLoading && (
        <ForecastMessage variant="error" title="Could not load the forecast" text={forecastError} onRetry={reload} />
      )}

      {forecast && !forecastLoading && (
        <div key={forecast.eventId} className="space-y-6">
          <Reveal><SyntheticDataBanner forecast={forecast} /></Reveal>

          {tiers.length === 0 ? (
            <ForecastMessage
              variant="info"
              title="No ticket tiers to forecast"
              text="This event has no ticket tiers yet. Add at least one tier to get a forecast."
            />
          ) : (
            <>
              <SummaryStats forecast={forecast} />
              <TierGrid forecast={forecast} activeTierId={activeTierId} onSelectTier={setChosenTierId} />
              <Reveal>
                <TrajectoryChart forecast={forecast} activeTierId={activeTierId} onSelectTier={setChosenTierId} />
              </Reveal>

              {viewKind === 'backtest' && forecast.replay && (
                <Reveal><ReplayPanel replay={forecast.replay} /></Reveal>
              )}
              {forecast.historical && (
                <Reveal><HistoricalPanel historical={forecast.historical} /></Reveal>
              )}
            </>
          )}

          {forecast.evaluation && (
            <Reveal><ModelTransparency evaluation={forecast.evaluation} /></Reveal>
          )}
        </div>
      )}
    </div>
  );
}
