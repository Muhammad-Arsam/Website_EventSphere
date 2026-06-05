'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { attendeeService } from '@/api/attendeeService';
import { AttendeeEvent } from '@/types/attendee.types';
import {
    Calendar,
    MapPin,
    Tag,
    Search,
    Loader2,
    Sparkles,
    Ticket,
    Building2,
    AlertTriangle,
    Inbox,
    CalendarDays,
} from 'lucide-react';

export default function MyEventsPage() {
    const [events, setEvents] = useState<AttendeeEvent[]>([]);
    const [filtered, setFiltered] = useState<AttendeeEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                const data = await attendeeService.getMyEvents();
                setEvents(data);
                setFiltered(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load your events.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Client‑side search filter
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFiltered(events);
            return;
        }
        const q = searchQuery.toLowerCase();
        setFiltered(
            events.filter(
                (e) =>
                    e.title.toLowerCase().includes(q) ||
                    e.organization.toLowerCase().includes(q) ||
                    e.category?.toLowerCase().includes(q) ||
                    e.city?.toLowerCase().includes(q)
            )
        );
    }, [searchQuery, events]);

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(dateString));
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-5">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Loading your events</h2>
                <p className="text-gray-500 text-sm">Please wait while we fetch your events.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                <p className="text-gray-500 max-w-md">{error}</p>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
                    <CalendarDays className="w-10 h-10 text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No events yet</h2>
                <p className="text-gray-500 max-w-md">
                    You haven't registered for any events. Browse events and book your first ticket!
                </p>
                <Link
                    href="/attendee/explore"
                    className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors"
                >
                    Browse Events
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Hero Section – brand gradient (matching My Tickets / My Orders) */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-700 via-brand-500 to-brand-900 p-8 text-white shadow-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <CalendarDays className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold">My Events</h1>
                    </div>
                    <p className="text-white/80 max-w-2xl">
                        Here are all the events you have registered for on Eventsphere.
                    </p>
                    <div className="mt-4 text-sm text-white/60">
                        {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
                    </div>
                </div>
            </div>

            {/* Search Bar - Modern & Attractive */}
            <div className="relative max-w-2xl group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-11 h-11 rounded-xl bg-linear-to-br from-brand-100 to-brand-50 flex items-center justify-center shadow-sm group-focus-within:shadow-md group-focus-within:from-brand-200 group-focus-within:to-brand-100 transition-all duration-200">
                        <Search className="w-5 h-5 text-brand-600" />
                    </div>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by event name, organization, category or city..."
                    className="w-full h-14 pl-20 pr-5 rounded-2xl border-0 bg-gray-50 text-gray-900 placeholder:text-gray-400 shadow-md focus:shadow-lg focus:ring-2 focus:ring-brand-300 focus:outline-none transition-all duration-200 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                />
            </div>

            {/* Events Grid */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
                        <Inbox className="w-10 h-10 text-gray-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {searchQuery ? 'No events match your search' : 'No events yet'}
                    </h2>
                    <p className="text-gray-500 max-w-md">
                        {searchQuery
                            ? 'Try searching with different keywords.'
                            : 'You haven’t registered for any events yet.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                    {filtered.map((event) => (
                        <Link
                            key={event.slug}
                            href={`/explore/${event.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative bg-white rounded-[28px] border border-gray-200 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                        >
                            {/* Event Image */}
                            <div className="relative w-full h-56 overflow-hidden bg-gray-100">
                                {event.image ? (
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-brand-50 to-blue-50">
                                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3">
                                            <Ticket className="w-8 h-8 text-brand-600" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No image available</p>
                                    </div>
                                )}
                            </div>

                            {/* Card Content */}
                            <div className="p-5">
                                <div className="mb-4">
                                    <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
                                        {event.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                        <Building2 className="w-4 h-4 text-brand-500 shrink-0" />
                                        <span className="truncate">{event.organization}</span>
                                    </div>
                                    {event.category && (
                                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            {event.category}
                                        </div>
                                    )}
                                </div>

                                {/* Event Meta */}
                                <div className="space-y-3 mb-5">
                                    <div className="flex items-start gap-3 text-sm text-gray-600">
                                        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                                            <Calendar className="w-4 h-4 text-brand-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{formatDate(event.start)}</p>
                                            <p className="text-xs text-gray-500">Event Date</p>
                                        </div>
                                    </div>

                                    {(event.venue || event.city || event.state || event.country) && (
                                        <div className="flex items-start gap-3 text-sm text-gray-600">
                                            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                                                <MapPin className="w-4 h-4 text-brand-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 whitespace-normal wrap-break-word">
                                                    {[event.venue, event.address, event.city, event.state, event.country]
                                                        .filter(Boolean)
                                                        .join(', ')}
                                                </p>
                                                <p className="text-xs text-gray-500">Location</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tags – optional, if we had tags; we can omit or show category as a tag */}
                                {event.category && (
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 text-xs font-medium">
                                            <Tag className="w-3 h-3" />
                                            {event.category}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}