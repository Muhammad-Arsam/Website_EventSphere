'use client';

import React, { useEffect, useState } from 'react';
import {
    ShoppingBag, ChevronDown, CalendarDays,
} from 'lucide-react';
import { eventService } from '@/api/eventService';
import { EventResponse } from '@/types/event.types';
import EventOrdersTable from '@/components/orders/EventOrdersTable';

export default function OrdersPageClient() {
    const [events, setEvents] = useState<EventResponse[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const orgId = localStorage.getItem('orgId');
        if (!orgId) {
            setError('Organization not found. Please log in again.');
            setIsLoading(false);
            return;
        }

        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                const data = await eventService.getOrgEvents(orgId);
                const published = data.filter(e => e.status === 'PUBLISHED');
                setEvents(published);
                if (published.length > 0) setSelectedEventId(published[0].id);
            } catch (err: any) {
                setError(err.message || 'Failed to load events.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const selectedEvent = events.find(e => e.id === selectedEventId);

    // ── Loading ──
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <div className="animate-pulse h-[172px] w-full rounded-3xl bg-gray-100 dark:bg-gray-800" />
                <div className="animate-pulse rounded-3xl bg-gray-100 dark:bg-gray-800 h-[400px]" />
            </div>
        );
    }

    // ── Error ──
    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="rounded-2xl border border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-500/10 p-6 text-sm text-red-600 dark:text-red-400">
                    {error}
                </div>
            </div>
        );
    }

    // ── No events ──
    if (events.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-white/2 p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-5">
                        <CalendarDays className="w-8 h-8 text-brand-500" />
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-lg mb-1">No Events Found</p>
                    <p className="text-sm text-gray-400 max-w-xs">
                        Create and publish an event to start receiving orders.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

            {/* ── Hero Banner (matches EventAnalyticsMetrics) ── */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-700 via-brand-500 to-brand-900 p-8 text-white shadow-xl">

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />

                <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-sm font-medium text-white/70">Orders Management</p>
                        </div>

                        <h2 className="text-3xl font-bold lg:text-4xl">
                            {selectedEvent?.title}
                        </h2>

                        <p className="mt-3 max-w-2xl text-white/80">
                            View ticket purchases and buyer details for your events.
                        </p>
                    </div>

                    <div className="relative w-full lg:w-auto lg:min-w-[320px]">
                        <select
                            value={selectedEventId}
                            onChange={e => setSelectedEventId(e.target.value)}
                            className="w-full appearance-none rounded-2xl border border-white/20 bg-white/10 px-5 py-3 pr-12 text-sm font-semibold text-white backdrop-blur-xl outline-none transition-all hover:bg-white/15"
                        >
                            {events.map(event => (
                                <option key={event.id} value={event.id} className="text-black">
                                    {event.title}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
                    </div>
                </div>
            </div>

            {/* ── Orders table ── */}
            {selectedEventId && (
                <EventOrdersTable key={selectedEventId} eventId={selectedEventId} />
            )}
        </div>
    );
}