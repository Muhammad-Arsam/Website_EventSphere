'use client';

import React from 'react';
import { Ticket, Minus, Plus } from 'lucide-react';
import { PublicTicket } from '@/types/event.types';

interface StepTicketsProps {
  tickets: PublicTicket[];
  selections: Record<string, number>;
  setSelections: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  totalAmount: number;
  primaryColor: string;
  secondaryColor: string;
  onNext: () => void;
}

export default function StepTickets({
  tickets, selections, setSelections,
  totalAmount, primaryColor, secondaryColor, onNext,
}: StepTicketsProps) {
  const MAX_PER_TIER = 10;

  const adjust = (id: string, delta: number) => {
    setSelections(prev => {
      const current = prev[id] || 0;
      const next    = Math.max(0, Math.min(MAX_PER_TIER, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const totalTickets = Object.values(selections).reduce((s, q) => s + q, 0);
  const canProceed   = totalTickets > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-6 py-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500 mb-4">
          Select ticket quantities
        </p>

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-brand-500 text-sm">No tickets available for this event.</p>
          </div>
        ) : tickets.map((ticket) => {
          const qty = selections[ticket.id] || 0;
          return (
            <div
              key={ticket.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                ticket.soldOut
                  ? 'opacity-40 bg-slate-50 border-slate-100'
                  : qty > 0
                    ? 'border-2 bg-white'
                    : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
              style={qty > 0 && !ticket.soldOut ? { borderColor: primaryColor, background: `${primaryColor}05` } : {}}
            >
              {/* Left — info */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="p-2.5 rounded-xl shrink-0"
                  style={{ background: `${primaryColor}12`, color: primaryColor }}
                >
                  <Ticket className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm leading-tight">{ticket.tierName}</p>
                  {ticket.soldOut
                    ? <p className="text-xs text-red-500 font-semibold mt-0.5">Sold Out</p>
                    : <p className="text-xs font-bold mt-0.5" style={{ color: primaryColor }}>
                        Rs.{ticket.price.toLocaleString()}
                      </p>
                  }
                </div>
              </div>

              {/* Right — quantity controls */}
              {!ticket.soldOut && (
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => adjust(ticket.id, -1)}
                    disabled={qty === 0}
                    className="w-8 h-8 rounded-full border flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
                    style={{ borderColor: qty > 0 ? primaryColor : '#e2e8f0', color: qty > 0 ? primaryColor : '#94a3b8' }}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span
                    className="w-6 text-center text-sm font-black tabular-nums"
                    style={{ color: qty > 0 ? primaryColor : '#94a3b8' }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() => adjust(ticket.id, 1)}
                    disabled={qty >= MAX_PER_TIER}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white hover:opacity-90"
                    style={{ background: primaryColor }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer — total + CTA */}
      <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500">
              {totalTickets > 0 ? `${totalTickets} ticket${totalTickets > 1 ? 's' : ''}` : 'No tickets selected'}
            </p>
            <p className="text-2xl font-black text-slate-900 tabular-nums">
              Rs.{totalAmount.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="px-7 py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0"
            style={{ background: canProceed ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` : '#e2e8f0', color: canProceed ? '#fff' : '#94a3b8' }}
          >
            Continue →
          </button>
        </div>
        <p className="text-[10px] text-brand-400 text-center font-medium">
          Supports JazzCash · EasyPaisa
        </p>
      </div>
    </div>
  );
}