'use client';

import React from 'react';
import { useState } from 'react';
import { Ticket, Clock, User, Mail, Phone, CreditCard, Tag, Loader2, ChevronLeft, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { PublicTicket, PublicAgendaItem } from '@/types/event.types';

interface StepReviewProps {
  tickets: PublicTicket[];
  selections: Record<string, number>;
  agenda: PublicAgendaItem[];
  selectedSubEvents: string[];
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCnic: string;
  promoCode: string;
  setPromoCode: (v: string) => void;
  totalAmount: number;
  primaryColor: string;
  secondaryColor: string;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
  rawTotal: number;
  discount: number;
  promoApplied: boolean;
  onApplyPromo: (code: string) => Promise<{ isValid: boolean; percentage: number }>;
}

export default function StepReview({
  tickets, selections, agenda, selectedSubEvents,
  buyerName, buyerEmail, buyerPhone, buyerCnic,
  promoCode, promoApplied, discount, rawTotal, setPromoCode,
  totalAmount, primaryColor, secondaryColor,
  isSubmitting, onBack, onSubmit, onApplyPromo,
}: StepReviewProps) {
  const fmtTime = (dt: string) =>
    new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(dt));

  const selectedTickets = tickets.filter(t => (selections[t.id] || 0) > 0);
  const selectedSessions = agenda.filter(a => selectedSubEvents.includes(a.id));

  const [isValidating, setIsValidating] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsValidating(true);
    setPromoError(null);
    setPromoSuccess(null);
    try {
      const result = await onApplyPromo(promoCode.trim());
      if (result.isValid) {
        setPromoSuccess(`${result.percentage}% discount applied!`);
      } else {
        setPromoError('Invalid or expired promo code.');
      }
    } catch {
      setPromoError('Could not validate code. Try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-6 py-5 space-y-5">

        {/* Selected sessions */}
        {selectedSessions.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 mb-2">
              Sessions ({selectedSessions.length})
            </p>
            <div className="rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
              {selectedSessions.map(s => (
                <div key={s.id} className="flex items-start gap-3 px-4 py-3 bg-white">
                  <div className="p-1.5 rounded-lg shrink-0 mt-0.5" style={{ background: `${primaryColor}12`, color: primaryColor }}>
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 leading-snug">{s.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {fmtTime(s.startTime)} — {fmtTime(s.endTime)}
                      {s.roomOrLocation && ` · ${s.roomOrLocation}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buyer info */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 mb-2">
            Your Details
          </p>
          <div className="rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
            {[
              { icon: <User className="w-3.5 h-3.5" />, label: 'Name', value: buyerName },
              { icon: <Mail className="w-3.5 h-3.5" />, label: 'Email', value: buyerEmail },
              { icon: <Phone className="w-3.5 h-3.5" />, label: 'Phone', value: buyerPhone },
              { icon: <CreditCard className="w-3.5 h-3.5" />, label: 'CNIC', value: buyerCnic },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 bg-white">
                <div className="p-1.5 rounded-lg shrink-0" style={{ background: `${primaryColor}12`, color: primaryColor }}>
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket summary */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 mb-2">
            Tickets
          </p>
          <div className="rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
            {selectedTickets.map(t => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg" style={{ background: `${primaryColor}12`, color: primaryColor }}>
                    <Ticket className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.tierName}</p>
                    <p className="text-[11px] text-slate-400">× {selections[t.id]}</p>
                  </div>
                </div>
                <p className="text-sm font-black text-slate-900 tabular-nums">
                  Rs.{(t.price * (selections[t.id] || 0)).toLocaleString()}
                </p>
              </div>
            ))}
            {/* Total row */}
            <div className="px-4 py-3 space-y-1" style={{ background: `${primaryColor}06` }}>
              {promoApplied && discount > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 line-through tabular-nums">Rs.{rawTotal.toLocaleString()}</p>
                  <p className="text-xs font-bold text-emerald-600">-{discount}% off</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wider text-brand-500">Total</p>
                <p className="text-lg font-black tabular-nums" style={{ color: primaryColor }}>
                  Rs.{totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Promo code */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 mb-2">
            Promo Code <span className="text-brand-400 normal-case font-medium">(optional)</span>
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="text"
                value={promoCode}
                onChange={e => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoError(null);
                  setPromoSuccess(null);
                }}
                disabled={promoApplied}
                placeholder="ENTER CODE"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold tracking-wider placeholder:text-slate-300 placeholder:font-medium placeholder:tracking-widest outline-none transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
            <button
              onClick={handleApplyPromo}
              disabled={isValidating || promoApplied || !promoCode.trim()}
              className="px-4 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
            >
              {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : promoApplied ? <CheckCircle2 className="w-4 h-4" /> : 'Apply'}
            </button>
          </div>
          {promoError && <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1"><XCircle className="w-3.5 h-3.5" />{promoError}</p>}
          {promoSuccess && <p className="mt-1.5 text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{promoSuccess}</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-4 py-3.5 rounded-2xl border border-slate-200 text-brand-600 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>Confirm & Pay · Rs.{totalAmount.toLocaleString()}</>
            )}
          </button>
        </div>
        <p className="text-[10px] text-brand-400 text-center font-medium flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3 h-3 shrink-0" />
          Secured checkout · JazzCash · EasyPaisa
        </p>
      </div>
    </div>
  );
}