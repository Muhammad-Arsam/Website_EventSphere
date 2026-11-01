'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'framer-motion';
import { CalendarDays, Check, ChevronDown, X } from 'lucide-react';
import type { EventResponse } from '@/types/event.types';
import { formatEventDate, getEventStatusTone } from '../forecastHelpers';
import { TONES } from '../forecastTheme';

interface Props {
  events: EventResponse[];
  selectedId: string;
  onSelect: (id: string) => void;
}

// Phones (below the Tailwind "sm" breakpoint, 640px) get a bottom sheet.
// Larger screens get a dropdown under the button.
const MOBILE_QUERY = '(max-width: 639px)';
const subscribeMobile = (onChange: () => void) => {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
};
const getIsMobile = () => window.matchMedia(MOBILE_QUERY).matches;
const getIsMobileOnServer = () => false;

// Draws its children on top of the whole page (a portal). It is a component of its own
// because AnimatePresence only accepts normal elements as children, not a raw portal.
function BodyPortal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}

// One row of the list (used by both the dropdown and the bottom sheet)
function EventOption({ event, active, onPick }: { event: EventResponse; active: boolean; onPick: () => void }) {
  return (
    <li role="option" aria-selected={active}>
      <button
        type="button"
        onClick={onPick}
        className={`flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
          active
            ? 'bg-brand-50 ring-1 ring-brand-200 dark:bg-brand-500/15 dark:ring-brand-500/30'
            : 'hover:bg-brand-25 active:bg-brand-50 dark:hover:bg-white/5 dark:active:bg-white/10'
        }`}
      >
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${TONES[getEventStatusTone(event.status)].dot}`} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">{event.title}</span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            {formatEventDate(event.startDateTime)} · {event.status}
          </span>
        </span>
        {active && <Check className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" />}
      </button>
    </li>
  );
}

// A custom picker (instead of the plain <select>) so it can show dates and status.
export default function EventPicker({ events, selectedId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();
  const isMobile = useSyncExternalStore(subscribeMobile, getIsMobile, getIsMobileOnServer);
  const selected = events.find((e) => e.id === selectedId);

  const close = useCallback(() => setOpen(false), []);
  const pick = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  // Escape closes. On desktop, a click outside closes too.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    if (!isMobile) document.addEventListener('mousedown', onClick); // on phones the backdrop closes it
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open, isMobile]);

  // The page behind the bottom sheet must not scroll
  useEffect(() => {
    if (!open || !isMobile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, isMobile]);

  const sheet = (
    <div className="fixed inset-0 z-[100000] flex items-end" role="dialog" aria-modal="true" aria-label="Select an event">
      <motion.div
        className="absolute inset-0 bg-brand-950/60 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={close}
      />
      <motion.div
        className="relative flex max-h-[80dvh] w-full flex-col rounded-t-3xl border-t border-brand-100 bg-white shadow-2xl dark:border-brand-900 dark:bg-gray-900"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 34, stiffness: 340 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 90 || info.velocity.y > 500) close();
        }}
      >
        {/* Drag handle and title: pull down to close */}
        <div className="touch-none select-none px-5 pb-2 pt-2.5" onPointerDown={(e) => dragControls.start(e)}>
          <div className="mx-auto h-1.5 w-11 rounded-full bg-brand-200 dark:bg-brand-800" />
          <div className="mt-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Select event</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {events.length} {events.length === 1 ? 'event' : 'events'}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition active:scale-95 dark:bg-brand-500/15 dark:text-brand-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <ul role="listbox" className="space-y-1 overflow-y-auto overscroll-contain px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1">
          {events.map((event) => (
            <EventOption key={event.id} event={event} active={event.id === selectedId} onPick={() => pick(event.id)} />
          ))}
        </ul>
      </motion.div>
    </div>
  );

  return (
    <div ref={rootRef} className="relative w-full min-w-0 lg:w-[340px]">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-2xl border border-brand-300/30 bg-brand-400/15 px-4 py-3 text-left text-white backdrop-blur-xl outline-none transition hover:bg-brand-400/25 focus-visible:ring-2 focus-visible:ring-brand-300"
      >
        <CalendarDays className="h-5 w-5 shrink-0 text-brand-200" />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium uppercase tracking-wider text-brand-200/80">Event</span>
          <span className="block truncate text-sm font-semibold">{selected?.title ?? 'Select an event'}</span>
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-brand-200 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Desktop: dropdown under the button */}
      <AnimatePresence>
        {open && !isMobile && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-50 mt-2 max-h-80 w-full space-y-1 overflow-y-auto rounded-2xl border border-brand-100 bg-white p-1.5 shadow-2xl dark:border-brand-900 dark:bg-gray-900"
          >
            {events.map((event) => (
              <EventOption key={event.id} event={event} active={event.id === selectedId} onPick={() => pick(event.id)} />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Phone: bottom sheet (drawn on top of the whole page) */}
      <AnimatePresence>{open && isMobile && <BodyPortal key="sheet">{sheet}</BodyPortal>}</AnimatePresence>
    </div>
  );
}