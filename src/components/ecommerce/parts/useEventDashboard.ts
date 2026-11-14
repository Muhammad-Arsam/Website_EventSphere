'use client';

// All data logic for the dashboard (same idea as useDemandForecast / useEventChat).
// 1) loads the organizer's PUBLISHED events
// 2) for the selected event, loads analytics, orders and tickets SEPARATELY, so a slow or
//    failing orders request never blocks the KPI cards.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { eventService } from '@/api/eventService';
import { analyticsService } from '@/api/analyticsService';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getOrgId } from '@/utils/token';
import type { EventResponse } from '@/types/event.types';
import { sortEventsByRelevance } from '../dashboardShared';

// Stable references (defined once, outside the component) so the hook does not re-run.
const loadAnalytics = analyticsService.getEventAnalytics;
const loadOrders = eventService.getEventOrders;
const loadTickets = eventService.getAllTickets;

export function useEventDashboard() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  // 1) Load events once
  useEffect(() => {
    let cancelled = false;

    const loadEvents = async () => {
      const orgId = getOrgId();
      if (!orgId) {
        setEventsError('Organization not found. Please log in again.');
        setEventsLoading(false);
        return;
      }
      try {
        const data = await eventService.getOrgEvents(orgId);
        if (cancelled) return;
        const published = sortEventsByRelevance(data.filter((e) => e.status === 'PUBLISHED'));
        setEvents(published);
        if (published.length > 0) setSelectedEventId(published[0].id);
      } catch (err) {
        if (!cancelled) setEventsError(err instanceof Error ? err.message : 'Failed to load events.');
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    };

    loadEvents();
    return () => { cancelled = true; };
  }, []);

  // 2) Data of the selected event
  const analytics = useAsyncResource(selectedEventId, loadAnalytics, reloadToken);
  const orders = useAsyncResource(selectedEventId, loadOrders, reloadToken);
  const tickets = useAsyncResource(selectedEventId, loadTickets, reloadToken);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  return {
    events,
    eventsLoading,
    eventsError,
    selectedEventId,
    selectedEvent,
    selectEvent: setSelectedEventId,
    analytics,
    orders,
    tickets,
    reload,
  };
}
