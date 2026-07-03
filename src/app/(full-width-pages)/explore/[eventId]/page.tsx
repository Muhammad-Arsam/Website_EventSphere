'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { publicService } from '@/api/publicService';
import { sponsorService } from '@/api/sponsorService'; // ✅ imported sponsorService
import { EventTemplateData } from '@/types/template.types';
import { PublicEventPageResponse } from '@/types/event.types';
import { Sponsor } from '@/types/sponsor.types'; // ✅ imported Sponsor type

import Template1 from '@/components/templates/Template1';
import Template2 from '@/components/templates/Template2';
import Template3 from '@/components/templates/Template3';
import CheckoutModal from '@/components/checkout/CheckoutModal';

import { Loader2, Ticket, AlertTriangle, ArrowRight } from 'lucide-react';

export default function PublicEventPage() {
  const params = useParams();
  const slug = params.eventId as string;

  // ✅ Extend state to include sponsors
  const [templateData, setTemplateData] = useState<(EventTemplateData & { sponsors?: Sponsor[] }) | null>(null);
  const [rawResponse, setRawResponse] = useState<PublicEventPageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) return;
      try {
        setIsLoading(true);

        // 1. Fetch public event data
        const response = await publicService.getEventBySlug(slug);
        const assembled = publicService.assembleTemplateData(response);

        if (!assembled) {
          setError('This event page has not been configured yet.');
          return;
        }

        // 2. Fetch sponsors using the event ID
        const eventId = response.eventDetails.id;
        const sponsors = await sponsorService.getSponsors(eventId);

        // 3. Merge sponsors into the data
        const fullData: EventTemplateData & { sponsors?: Sponsor[] } = {
          ...assembled,
          sponsors,
        };

        setRawResponse(response);
        setTemplateData(fullData);
      } catch (err: any) {
        setError(err.message || 'Event not found.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  // ─── Loading / Error states ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center shadow-sm mb-6">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Event</h2>
          <p className="text-gray-500 text-sm max-w-sm">
            Please wait while we prepare the landing page for you.
          </p>
        </div>
      </div>
    );
  }

  if (error || !templateData || !rawResponse) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-24 h-24 rounded-[28px] bg-red-50 border border-red-100 flex items-center justify-center shadow-sm mb-8">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-3">Event Not Found</h1>
          <p className="text-gray-500 leading-relaxed mb-8">
            {error || "We couldn't find the event you're looking for."}
          </p>
          <a
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-0.5"
          >
            <Ticket className="w-5 h-5" />
            Browse Events
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  const sharedCheckoutProps = {
    onCheckout: () => setCheckoutOpen(true),
  };

  return (
    <>
      {/* Render the correct template */}
      {templateData.templateName === 'MINIMAL' && (
        <Template2 data={templateData} {...sharedCheckoutProps} />
      )}
      {templateData.templateName === 'MODERN' && (
        <Template3 data={templateData} {...sharedCheckoutProps} />
      )}
      {templateData.templateName !== 'MINIMAL' && templateData.templateName !== 'MODERN' && (
        <Template1 data={templateData} {...sharedCheckoutProps} />
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        eventId={rawResponse.eventDetails.id}
        eventTitle={templateData.title}
        tickets={rawResponse.tickets}
        agenda={rawResponse.agenda}
        primaryColor={templateData.primaryColor}
        secondaryColor={templateData.secondaryColor ?? templateData.primaryColor}
      />
    </>
  );
}