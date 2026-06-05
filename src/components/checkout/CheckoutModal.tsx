'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { PublicAgendaItem, PublicTicket, CheckoutRequest, TicketSelection, CheckoutResponse } from '@/types/event.types';
import { publicService } from '@/api/publicService';
import StepTickets from './StepTickets';
import StepSubEvents from './StepSubEvents';
import StepBuyerDetails from './StepBuyerDetails';
import StepReview from './StepReview';
import StepSuccess from './StepSuccess';
import Alert from '@/components/ui/alert/Alert';

export type CheckoutStep = 'tickets' | 'subevents' | 'buyer' | 'review' | 'success';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  tickets: PublicTicket[];
  agenda: PublicAgendaItem[];
  primaryColor: string;
  secondaryColor: string;
}

const STEPS: CheckoutStep[] = ['tickets', 'subevents', 'buyer', 'review', 'success'];
const STEP_LABELS: Record<CheckoutStep, string> = {
  tickets: 'Tickets',
  subevents: 'Sessions',
  buyer: 'Your Info',
  review: 'Review',
  success: 'Done',
};

export default function CheckoutModal({
  isOpen, onClose,
  eventId, eventTitle,
  tickets, agenda,
  primaryColor, secondaryColor,
}: CheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>('tickets');
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [selectedSubEvents, setSelectedSubEvents] = useState<string[]>([]);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerCnic, setBuyerCnic] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ variant: 'success' | 'error'; title: string; message: string } | null>(null);
  const [checkoutResponse, setCheckoutResponse] = useState<CheckoutResponse | null>(null);


  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('tickets');
      setSelections({});
      setSelectedSubEvents([]);
      setBuyerName('');
      setBuyerEmail('');
      setBuyerPhone('');
      setBuyerCnic('');
      setPromoCode('');
      setAlert(null);
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setDiscount(0);
      setPromoApplied(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const stepIndex = STEPS.indexOf(step);
  const visibleSteps = STEPS.filter(s => s !== 'success');

  const rawTotal = tickets.reduce((sum, t) => {
    const qty = selections[t.id] || 0;
    return sum + (t.price * qty);
  }, 0);

  const totalAmount = promoApplied && discount > 0
    ? Math.round(rawTotal * (1 - discount / 100))
    : rawTotal;

  const ticketSelections: TicketSelection[] = Object.entries(selections)
    .filter(([, qty]) => qty > 0)
    .map(([tierId, quantity]) => ({ tierId, quantity }));

  const hasTickets = ticketSelections.length > 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setAlert(null);

    try {
      const payload: CheckoutRequest = {
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
        buyerPhone: buyerPhone.trim(),
        buyerCnic: buyerCnic.trim(),
        ticketSelections,
        selectedSubEventIds: selectedSubEvents.length > 0 ? selectedSubEvents : undefined,
        promoCode: promoCode.trim() || undefined,
      };

      const response = await publicService.checkout(eventId, payload);

      setCheckoutResponse(response);

      setStep('success');
    } catch (err: any) {
      setAlert({
        variant: 'error',
        title: 'Checkout Failed',
        message: err.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressWidth = step === 'success' ? 100 : ((stepIndex) / (visibleSteps.length - 1)) * 100;

  return (
    <>
      {/* Alert toast */}
      {alert && (
        <div className="fixed top-6 right-6 z-99999 w-full max-w-sm drop-shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
        />
        </div>
      )}

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={step !== 'success' ? onClose : undefined}
      />

      {/* Modal — slide-up drawer on mobile, centered on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-70 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4 pointer-events-none">
        <div
          className={`
            pointer-events-auto
            w-full sm:w-full sm:max-w-lg
            bg-white rounded-t-3xl sm:rounded-3xl
            shadow-2xl overflow-hidden
            flex flex-col
            max-h-[92vh] sm:max-h-[88vh]
            animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in duration-300
          `}
        >
          {/* Header */}
          <div className="shrink-0 px-6 pt-5 pb-4 border-b border-slate-100">
            {/* Mobile drag handle */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500 mb-0.5">
                  {step === 'success' ? 'Order Confirmed' : 'Checkout'}
                </p>
                <h2 className="text-base font-black text-slate-900 leading-tight line-clamp-1">{eventTitle}</h2>
              </div>
              {step !== 'success' && (
                <button
                  onClick={onClose}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Step progress bar */}
            {step !== 'success' && (
              <div className="mt-4">
                {/* Step labels */}
                <div className="flex justify-between mb-2">
                  {visibleSteps.map((s, i) => (
                    <span
                      key={s}
                      className="text-[9px] font-bold uppercase tracking-wider transition-colors"
                      style={{ color: i <= stepIndex ? primaryColor : '#cbd5e1' }}
                    >
                      {STEP_LABELS[s]}
                    </span>
                  ))}
                </div>
                {/* Progress bar */}
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressWidth}%`,
                      background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {step === 'tickets' && (
              <StepTickets
                tickets={tickets}
                selections={selections}
                setSelections={setSelections}
                totalAmount={totalAmount}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                onNext={() => setStep(agenda.length > 0 ? 'subevents' : 'buyer')}
              />
            )}
            {step === 'subevents' && (
              <StepSubEvents
                agenda={agenda}
                selectedSubEvents={selectedSubEvents}
                setSelectedSubEvents={setSelectedSubEvents}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                onBack={() => setStep('tickets')}
                onNext={() => setStep('buyer')}
              />
            )}
            {step === 'buyer' && (
              <StepBuyerDetails
                buyerName={buyerName} setBuyerName={setBuyerName}
                buyerEmail={buyerEmail} setBuyerEmail={setBuyerEmail}
                buyerPhone={buyerPhone} setBuyerPhone={setBuyerPhone}
                buyerCnic={buyerCnic} setBuyerCnic={setBuyerCnic}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                onBack={() => setStep(agenda.length > 0 ? 'subevents' : 'tickets')}
                onNext={() => setStep('review')}
              />
            )}
            {step === 'review' && (
              <StepReview
                tickets={tickets}
                selections={selections}
                agenda={agenda}
                selectedSubEvents={selectedSubEvents}
                buyerName={buyerName}
                buyerEmail={buyerEmail}
                buyerPhone={buyerPhone}
                buyerCnic={buyerCnic}
                promoCode={promoCode}
                setPromoCode={setPromoCode}
                totalAmount={totalAmount}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                isSubmitting={isSubmitting}
                onBack={() => setStep('buyer')}
                onSubmit={handleSubmit}
                rawTotal={rawTotal}
                discount={discount}
                promoApplied={promoApplied}
                onApplyPromo={async (code) => {
                  try {
                    const result = await publicService.validatePromoCode(eventId, code);
                    if (result.isValid) {
                      setDiscount(result.percentage);
                      setPromoApplied(true);
                    } else {
                      setDiscount(0);
                      setPromoApplied(false);
                    }
                    return result;
                  } catch {
                    setDiscount(0);
                    setPromoApplied(false);
                    return { isValid: false, percentage: 0 };
                  }
                }}
              />
            )}
            {step === 'success' && (
              <StepSuccess
                buyerName={buyerName}
                buyerEmail={buyerEmail}
                totalAmount={checkoutResponse?.totalPaid ?? totalAmount}
                totalTickets={checkoutResponse?.totalTickets ?? 0}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                backendMessage={checkoutResponse?.message ?? ''}
                onClose={onClose}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}