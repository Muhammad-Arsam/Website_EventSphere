'use client';

import React from 'react';
import { Clock, MapPin, Check, ChevronLeft } from 'lucide-react';
import { PublicAgendaItem } from '@/types/event.types';

interface StepSubEventsProps {
  agenda: PublicAgendaItem[];
  selectedSubEvents: string[];
  setSelectedSubEvents: React.Dispatch<React.SetStateAction<string[]>>;
  primaryColor: string;
  secondaryColor: string;
  onBack: () => void;
  onNext: () => void;
}

export default function StepSubEvents({
  agenda, selectedSubEvents, setSelectedSubEvents,
  primaryColor, secondaryColor, onBack, onNext,
}: StepSubEventsProps) {
  const fmtTime = (dt: string) =>
    new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(dt));

  const toggle = (id: string) => {
    setSelectedSubEvents(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedSubEvents(agenda.map(a => a.id));
  const clearAll  = () => setSelectedSubEvents([]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-6 py-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">
              Sessions & Sub-Events
            </p>
            <p className="text-[11px] text-brand-500 mt-0.5">Optional — select the sessions you want to attend</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-colors"
              style={{ color: primaryColor, background: `${primaryColor}10` }}
            >
              All
            </button>
            <button
              onClick={clearAll}
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg text-brand-500 bg-slate-50 transition-colors hover:bg-slate-100"
            >
              None
            </button>
          </div>
        </div>

        {agenda.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No sessions available.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {agenda.map((item) => {
              const isSelected = selectedSubEvents.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all hover:border-slate-200"
                  style={isSelected
                    ? { borderColor: primaryColor, background: `${primaryColor}06`, borderWidth: '2px' }
                    : { borderColor: '#f1f5f9', background: 'white', borderWidth: '1px' }
                  }
                >
                  {/* Checkbox */}
                  <div
                    className="shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 transition-all"
                    style={isSelected
                      ? { background: primaryColor, borderColor: primaryColor }
                      : { background: 'white', borderColor: '#cbd5e1' }
                    }
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm leading-snug">{item.title}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        {fmtTime(item.startTime)} — {fmtTime(item.endTime)}
                      </span>
                      {item.roomOrLocation && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          <MapPin className="w-3 h-3" />
                          {item.roomOrLocation}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{item.description}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-4 py-3.5 rounded-2xl border border-slate-200 text-brand-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={onNext}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
          >
            {selectedSubEvents.length > 0
              ? `Continue with ${selectedSubEvents.length} session${selectedSubEvents.length > 1 ? 's' : ''}`
              : 'Skip & Continue →'
            }
          </button>
        </div>
      </div>
    </div>
  );
}