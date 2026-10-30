'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Check, ChevronDown } from 'lucide-react';
import type { EventResponse } from '@/types/event.types';
import { formatEventDate, getEventStatusTone } from '../forecastHelpers';
import { TONES } from '../forecastTheme';

interface Props {
  events: EventResponse[];
  selectedId: string;
  onSelect: (id: string) => void;
}

// A custom dropdown (instead of the plain <select>) so it can show dates and status.
export default function EventPicker({ events, selectedId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = events.find((e) => e.id === selectedId);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full lg:w-[340px]">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-left text-white backdrop-blur-xl outline-none transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/60"
      >
        <CalendarDays className="h-5 w-5 shrink-0 text-white/70" />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium uppercase tracking-wider text-white/60">Event</span>
          <span className="block truncate text-sm font-semibold">{selected?.title ?? 'Select an event'}</span>
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-white/70 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
          >
            {events.map((event) => {
              const active = event.id === selectedId;
              return (
                <li key={event.id} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => { onSelect(event.id); setOpen(false); }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      active ? 'bg-brand-50 dark:bg-brand-500/15' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${TONES[getEventStatusTone(event.status)].dot}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">{event.title}</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        {formatEventDate(event.startDateTime)} · {event.status}
                      </span>
                    </span>
                    {active && <Check className="h-4 w-4 shrink-0 text-brand-500" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
