'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { publicService } from '@/api/publicService';
import { EventTemplateData } from '@/types/template.types';

import Template1 from '@/components/templates/Template1';
import Template2 from '@/components/templates/Template2';
import Template3 from '@/components/templates/Template3';

import {
    Loader2,
    Ticket,
    AlertTriangle,
    ArrowRight,
} from 'lucide-react';

export default function PublicEventPage() {
    const params = useParams();
    const slug = params.eventId as string;

    const [templateData, setTemplateData] = useState<EventTemplateData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!slug) return;

            try {
                setIsLoading(true);

                const response = await publicService.getEventBySlug(slug);

                console.log('API Response:', JSON.stringify(response, null, 2));

                const assembled = publicService.assembleTemplateData(response);

                console.log('Assembled:', assembled);

                if (!assembled) {
                    setError('This event page has not been configured yet.');
                    return;
                }

                setTemplateData(assembled);
            } catch (err: any) {
                setError(err.message || 'Event not found.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvent();
    }, [slug]);

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-6">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center shadow-sm mb-6">
                        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Loading Event
                    </h2>

                    <p className="text-gray-500 text-sm max-w-sm">
                        Please wait while we prepare the Landing page for you.
                    </p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !templateData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-6">
                <div className="w-full max-w-md text-center">
                    <div className="mx-auto w-24 h-24 rounded-[28px] bg-red-50 border border-red-100 flex items-center justify-center shadow-sm mb-8">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-3">
                        Event Not Found
                    </h1>

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

    // Render Templates
    if (templateData.templateName === 'MINIMAL') {
        return <Template2 data={templateData} />;
    }

    if (templateData.templateName === 'MODERN') {
        return <Template3 data={templateData} />;
    }

    // Default: STANDARD
    return <Template1 data={templateData} />;
}