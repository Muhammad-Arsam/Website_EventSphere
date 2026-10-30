'use client';

// All data logic for the Demand Forecast page lives here (same idea as useEventChat).
// 1) loads the organizer's events  2) loads the forecast for the selected event.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { eventService } from '@/api/eventService';
import { analyticsService } from '@/api/analyticsService';
import { getOrgId } from '@/utils/token';
import type { EventResponse } from '@/types/event.types';
import type { DemandForecast } from '@/types/analytics.types';
import { sortEventsForForecast } from '../forecastHelpers';

export function useDemandForecast() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [selectedEventId, setSelectedEventId] = useState('');
  const [forecast, setForecast] = useState<DemandForecast | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

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
        const published = data.filter((e) => e.status === 'PUBLISHED');
        const sorted = sortEventsForForecast(published);
        setEvents(sorted);
        if (sorted.length > 0) setSelectedEventId(sorted[0].id);
      } catch (err) {
        if (!cancelled) setEventsError(err instanceof Error ? err.message : 'Failed to load events.');
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    };

    loadEvents();
    return () => { cancelled = true; };
  }, []);

  // 2) Load the forecast whenever the selected event changes (or Refresh is pressed).
  //    "cancelled" makes sure an old, slow response can never overwrite a newer one.
  useEffect(() => {
    if (!selectedEventId) return;
    let cancelled = false;

    const loadForecast = async () => {
      setForecastLoading(true);
      setForecastError(null);
      setForecast(null);
      try {
        const data = await analyticsService.getDemandForecast(selectedEventId);
        if (!cancelled) setForecast(data);
      } catch (err) {
        if (!cancelled) setForecastError(err instanceof Error ? err.message : 'Failed to load the forecast.');
      } finally {
        if (!cancelled) setForecastLoading(false);
      }
    };

    loadForecast();
    return () => { cancelled = true; };
  }, [selectedEventId, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

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
    forecast,
    forecastLoading,
    forecastError,
    reload,
  };
}
