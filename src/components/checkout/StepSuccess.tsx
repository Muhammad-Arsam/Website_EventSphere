'use client';

import React from 'react';
import {
  CheckCircle2,
  Mail,
  PartyPopper,
  AlertCircle,
  Ticket,
  Wallet,
} from 'lucide-react';

interface StepSuccessProps {
  buyerName: string;
  buyerEmail: string;
  totalAmount: number;
  totalTickets: number;
  primaryColor: string;
  secondaryColor: string;
  backendMessage: string;
  onClose: () => void;
}

export default function StepSuccess({
  buyerName,
  buyerEmail,
  totalAmount,
  totalTickets,
  backendMessage,
  primaryColor,
  secondaryColor,
  onClose,
}: StepSuccessProps) {
  const firstName = buyerName?.split(' ')[0] || 'Guest';

  return (
    <div className="px-6 py-8">
      <div className="max-w-md mx-auto">

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ backgroundColor: primaryColor }}
            />

            <div
              className="relative w-28 h-28 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
                border: `1px solid ${primaryColor}30`,
              }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                }}
              >
                <CheckCircle2
                  className="w-10 h-10 text-white"
                  strokeWidth={2.8}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            {/* <PartyPopper
              className="w-5 h-5"
              style={{ color: primaryColor }}
            /> */}
            <h2 className="text-3xl font-black text-slate-900">
              Booking Confirmed
            </h2>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Congratulations{' '}
            <span className="font-bold text-slate-900">
              {firstName}
            </span>
            ! Your registration has been completed successfully.
          </p>
        </div>

        {/* Summary Card */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div
            className="px-5 py-4 text-white"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            <h3 className="font-bold">
              Order Summary
            </h3>
          </div>

          <div className="grid grid-cols-2">
            <div className="p-5 border-r border-slate-100">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <Wallet className="w-4 h-4" />
                <span className="text-xs uppercase font-bold">
                  Total Paid
                </span>
              </div>

              <p
                className="text-2xl font-black"
                style={{ color: primaryColor }}
              >
                Rs. {totalAmount.toLocaleString()}
              </p>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <Ticket className="w-4 h-4" />
                <span className="text-xs uppercase font-bold">
                  Tickets
                </span>
              </div>

              <p
                className="text-2xl font-black"
                style={{ color: primaryColor }}
              >
                {totalTickets}
              </p>
            </div>
          </div>
        </div>

        {/* Order Details Card */}
        <div
          className="mt-5 rounded-3xl p-5"
          style={{
            background: `${primaryColor}08`,
            border: `1px solid ${primaryColor}20`,
          }}
        >
          <div className="space-y-5">

            {/* Payment Status */}
            <div className="flex gap-3">
              <div
                className="p-3 rounded-2xl h-fit"
                style={{
                  background: `${primaryColor}15`,
                  color: primaryColor,
                }}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>

              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-700 mb-1">
                  Payment Status
                </p>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {backendMessage}
                </p>
              </div>
            </div>

            <div className="h-px bg-slate-200" />

            {/* Email Details */}
            <div className="flex gap-3">
              <div
                className="p-3 rounded-2xl h-fit"
                style={{
                  background: `${primaryColor}15`,
                  color: primaryColor,
                }}
              >
                <Mail className="w-5 h-5" />
              </div>

              <div>
                <p className="font-bold text-slate-900 mb-1">
                  Confirmation Email Sent
                </p>

                <p className="text-sm text-slate-600 mb-2">
                  Tickets and receipt have been delivered to:
                </p>

                <p className="font-semibold text-slate-900 break-all">
                  {buyerEmail}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          className="mt-8 w-full py-4 rounded-2xl text-white font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            boxShadow: `0 12px 30px ${primaryColor}30`,
          }}
        >
          Done
        </button>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-brand-500 text-center">
          <AlertCircle
            className="w-4 h-4 shrink-0"
            style={{ color: primaryColor }}
          />
          Check your spam folder if the email doesn't arrive within a few minutes.
        </div>
      </div>
    </div>
  );
}