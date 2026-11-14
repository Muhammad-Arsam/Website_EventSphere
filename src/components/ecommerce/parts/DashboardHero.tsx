'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, MapPin, RefreshCw } from 'lucide-react';
import type { EventResponse } from '@/types/event.types';
import { EventPicker } from '../dashboardShared';
import { formatEventRange, formatLocation, getEventTiming } from '../dashboardHelpers';

interface Props {
  events: EventResponse[];
  selectedEvent: EventResponse | null;
  selectedEventId: string;
  onSelect: (id: string) => void;
  loading: boolean;
  onReload: () => void;
}

const CHIP = 'inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-md';

// Same look as the Demand Forecast hero, so both pages feel like one product.
export default function DashboardHero({
  events, selectedEvent, selectedEventId, onSelect, loading, onReload,
}: Props) {
  const reduceMotion = useReducedMotion();
  const timing = getEventTiming(selectedEvent);
  const location = formatLocation(selectedEvent);

  return (
    <div className="relative z-30 rounded-3xl bg-linear-to-br from-brand-950 via-brand-800 to-brand-900 p-6 text-white shadow-xl sm:p-8">
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
          className="absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-brand-400/25 blur-3xl"
          animate={reduceMotion ? undefined : { y: [0, -16, 0], x: [0, 14, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <svg className="absolute bottom-0 right-0 hidden h-40 w-[420px] opacity-60 md:block" viewBox="0 0 420 160" fill="none">
          <motion.path
            d="M0 140 C 50 138, 80 120, 130 112 S 210 80, 250 70 S 340 40, 420 14"
            stroke="#6FCF97" strokeWidth="3" strokeLinecap="round"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
          />
          <circle cx="250" cy="70" r="5" fill="#fff" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {timing.kind !== 'unknown' && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-md">
                {timing.kind === 'live' && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-300 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-300" />
                  </span>
                )}
                {timing.label}
              </span>
            )}
            <span className="text-sm font-medium text-white/70">Event Dashboard</span>
          </div>

          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
            {selectedEvent?.title ?? 'Event Dashboard'}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/75">
            Track ticket sales, revenue, attendance and check-ins for your event.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {selectedEvent && (
              <span className={CHIP}><CalendarDays className="h-3.5 w-3.5" /> {formatEventRange(selectedEvent)}</span>
            )}
            {location && <span className={CHIP}><MapPin className="h-3.5 w-3.5" /> {location}</span>}
          </div>
        </div>

        <div className="flex w-full items-end gap-2 lg:w-auto">
          <EventPicker events={events} selectedId={selectedEventId} onSelect={onSelect} />
          <button
            type="button"
            onClick={onReload}
            disabled={loading}
            aria-label="Refresh dashboard"
            title="Refresh dashboard"
            className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl border border-brand-300/30 bg-brand-400/15 text-brand-100 backdrop-blur-xl transition hover:bg-brand-400/25 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
