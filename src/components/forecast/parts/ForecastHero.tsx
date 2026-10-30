'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CalendarClock, Clock3, RefreshCw } from 'lucide-react';
import type { EventResponse } from '@/types/event.types';
import type { DemandForecast } from '@/types/analytics.types';
import { daysBetween, formatDate, getViewMeta } from '../forecastHelpers';
import EventPicker from './EventPicker';
import ViewTypeBadge from './ViewTypeBadge';

interface Props {
  events: EventResponse[];
  selectedEvent: EventResponse | null;
  selectedEventId: string;
  onSelect: (id: string) => void;
  forecast: DemandForecast | null;
  loading: boolean;
  onReload: () => void;
}

const CHIP = 'inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-md';

export default function ForecastHero({
  events, selectedEvent, selectedEventId, onSelect, forecast, loading, onReload,
}: Props) {
  const reduceMotion = useReducedMotion();
  const meta = forecast ? getViewMeta(forecast.viewType) : null;
  const daysAhead = forecast ? daysBetween(forecast.asOf, forecast.eventDate) : null;

  return (
    <div className="relative rounded-3xl bg-linear-to-br from-brand-950 via-brand-800 to-brand-900 p-6 text-white shadow-xl sm:p-8">
      {/* Decoration (clipped to the card, so the dropdown can still overflow it) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-70"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        />
        <motion.div
          className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl"
          animate={reduceMotion ? undefined : { y: [0, 18, 0], x: [0, -12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-violet-500/25 blur-3xl"
          animate={reduceMotion ? undefined : { y: [0, -16, 0], x: [0, 14, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Decorative trend line: solid = sales so far, dashed = forecast */}
        <svg className="absolute bottom-0 right-0 hidden h-40 w-[420px] opacity-60 md:block" viewBox="0 0 420 160" fill="none">
          <motion.path
            d="M0 140 C 50 138, 80 120, 130 112 S 210 80, 250 70"
            stroke="#6FCF97" strokeWidth="3" strokeLinecap="round"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
          />
          <motion.path
            d="M250 70 C 300 55, 350 35, 420 14"
            stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 9"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 1.2, ease: 'easeOut' }}
          />
          <circle cx="250" cy="70" r="5" fill="#fff" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {forecast && <ViewTypeBadge viewType={forecast.viewType} />}
            <span className="text-sm font-medium text-white/70">Demand Forecast</span>
          </div>

          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
            {selectedEvent?.title ?? 'Demand Forecast'}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/75">
            {meta?.description ?? 'Pick an event to see how its ticket sales are expected to develop.'}
          </p>

          {forecast && (
            <div className="mt-5 flex flex-wrap gap-2">
              <span className={CHIP}><Clock3 className="h-3.5 w-3.5" /> As of {formatDate(forecast.asOf)}</span>
              <span className={CHIP}><CalendarClock className="h-3.5 w-3.5" /> Target date {formatDate(forecast.eventDate)}</span>
              {daysAhead !== null && daysAhead > 0 && (
                <span className={CHIP}>Looking {daysAhead} {daysAhead === 1 ? 'day' : 'days'} ahead</span>
              )}
            </div>
          )}
        </div>

        <div className="flex w-full items-end gap-2 lg:w-auto">
          <EventPicker events={events} selectedId={selectedEventId} onSelect={onSelect} />
          <button
            type="button"
            onClick={onReload}
            disabled={loading}
            aria-label="Refresh forecast"
            title="Refresh forecast"
            className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
