'use client';

import React from 'react';
import { CheckCircle, Mail, PartyPopper, AlertCircle } from 'lucide-react';

interface StepSuccessProps {
  buyerName: string;
  buyerEmail: string;
  totalAmount: number;
  primaryColor: string;
  secondaryColor: string;
  onClose: () => void;
}

export default function StepSuccess({
  buyerName, buyerEmail, totalAmount,
  primaryColor, secondaryColor, onClose,
}: StepSuccessProps) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-10 space-y-6">

      {/* Animated check */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center animate-in zoom-in duration-500"
        style={{ background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`, border: `2px solid ${primaryColor}30` }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
        >
          <CheckCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
          <PartyPopper className="w-6 h-6" style={{ color: primaryColor }} />
          You're In!
        </h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">
          Hey <span className="font-bold text-slate-700">{buyerName.split(' ')[0]}</span>, your order of{' '}
          <span className="font-bold" style={{ color: primaryColor }}>Rs.{totalAmount.toLocaleString()}</span> has been confirmed.
        </p>
      </div>

      {/* Email notice */}
      <div
        className="flex items-start gap-3 p-4 rounded-2xl text-left w-full max-w-sm"
        style={{ background: `${primaryColor}08`, border: `1px solid ${primaryColor}20` }}
      >
        <div className="p-2 rounded-xl shrink-0" style={{ background: `${primaryColor}15`, color: primaryColor }}>
          <Mail className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-0.5">Confirmation Sent</p>
          <p className="text-xs text-slate-500 leading-snug">
            A confirmation email with your tickets has been sent to{' '}
            <span className="font-bold text-slate-700">{buyerEmail}</span>.
          </p>
        </div>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 hover:-translate-y-0.5 mt-2"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
      >
        Done
      </button>

      <p className="text-[11px] text-brand-400 font-medium flex items-center justify-center gap-1.5">
        <AlertCircle className="w-3 h-3 shrink-0" />
        Check your spam folder if you don't see the email.
      </p>
    </div>
  );
}