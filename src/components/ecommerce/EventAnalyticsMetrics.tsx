'use client';

// The dashboard frame: it loads the data (useEventDashboard) and connects the parts.
// Same idea as DemandForecastDashboard and EventChatbot: this file only wires things together.

import { Reveal, StatusMessage } from './dashboardShared';
import { useEventDashboard } from './parts/useEventDashboard';
import AttendanceDonut from './parts/AttendanceDonut';
import AttendanceFunnel from './parts/AttendanceFunnel';
import DashboardHero from './parts/DashboardHero';
import DashboardSkeleton from './parts/DashboardSkeleton';
import KpiGrid from './parts/KpiGrid';
import RateGauges from './parts/RateGauges';
import RecentOrdersCard from './parts/RecentOrdersCard';
import RevenueChart from './parts/RevenueChart';
import TierBreakdown from './parts/TierBreakdown';

// Makes the two cards in a row the same height.
const EQUAL = '[&>section]:h-full';

export default function EventAnalyticsMetrics() {
  const {
    events, eventsLoading, eventsError, selectedEventId, selectedEvent, selectEvent,
    analytics, orders, tickets, reload,
  } = useEventDashboard();

  if (eventsLoading) return <DashboardSkeleton />;

  if (eventsError) {
    return <StatusMessage variant="error" title="Could not load your events" text={eventsError} />;
  }

  if (events.length === 0) {
    return (
      <StatusMessage
        variant="empty"
        title="No published events"
        text="Publish an event to start seeing analytics here."
      />
    );
  }

  const refreshing = analytics.loading || orders.loading || tickets.loading;

  return (
    <div className="space-y-6 pb-20">
      <DashboardHero
        events={events}
        selectedEvent={selectedEvent}
        selectedEventId={selectedEventId}
        onSelect={selectEvent}
        loading={refreshing}
        onReload={reload}
      />

      {/* key = event id, so everything animates in again when another event is picked */}
      <div key={selectedEventId} className="space-y-6">
        {analytics.error ? (
          <StatusMessage variant="error" title="Could not load analytics" text={analytics.error} onRetry={reload} />
        ) : (
          <>
            <KpiGrid analytics={analytics.data} />

            {analytics.data && (
              <>
                <RateGauges analytics={analytics.data} />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Reveal className={EQUAL}><AttendanceDonut analytics={analytics.data} /></Reveal>
                  <Reveal delay={0.08} className={EQUAL}><AttendanceFunnel analytics={analytics.data} /></Reveal>
                </div>
              </>
            )}
          </>
        )}

        {/* Orders and tickets load on their own: if one fails, the rest of the page still works */}
        <Reveal>
          <RevenueChart orders={orders.data} loading={orders.loading} error={orders.error} />
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal className={EQUAL}><TierBreakdown tickets={tickets.data} loading={tickets.loading} error={tickets.error} /></Reveal>
          <Reveal delay={0.08} className={EQUAL}><RecentOrdersCard orders={orders.data} loading={orders.loading} error={orders.error} /></Reveal>
        </div>
      </div>
    </div>
  );
}
