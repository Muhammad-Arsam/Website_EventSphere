'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { publicService } from '@/api/publicService';
import { PublicEventCard } from '@/types/event.types';
import {
    MapPin,
    Calendar,
    Tag,
    Search,
    ArrowRight,
    Loader2,
    Sparkles,
    Ticket,
    Building2,
    AlertTriangle,
    Inbox,
} from 'lucide-react';

export default function PublicEventsPage() {
    const [events, setEvents] = useState<PublicEventCard[]>([]);
    const [filtered, setFiltered] = useState<PublicEventCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                const data = await publicService.getPublishedEvents();
                setEvents(data);
                setFiltered(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load events.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Client-side search filter
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
                    e.category.toLowerCase().includes(q) ||
                    e.city?.toLowerCase().includes(q) ||
                    e.tags?.some((t) => t.toLowerCase().includes(q))
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

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-100">

            {/* Hero Header */}
            <div className="relative overflow-hidden border-b border-gray-200 bg-white">
                <div className="absolute inset-0 `bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.10),transparent_30%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_30%)]" />

                {/* Decorative Blur */}
                <div className="absolute top-10 right-10 w-72 h-72 bg-brand-100/30 blur-3xl rounded-full" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-100/30 blur-3xl rounded-full" />

                <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-20">
                    <div className="max-w-4xl">

                        {/* Top Badge */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                                <Sparkles className="w-7 h-7 text-white" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600 mb-1">
                                    Browse Events
                                </p>

                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                                    Explore events happening across Pakistan
                                </h2>
                            </div>
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-tight mb-5">
                            Discover Amazing{' '}
                            <span className="text-brand-600">
                                Upcoming Events
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-2xl">
                            Find conferences, workshops, concerts, meetups, and more happening around you.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center group-focus-within:bg-brand-100 transition-colors">
                                    <Search className="w-5 h-5 text-brand-600" />
                                </div>
                            </div>

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by event name, city, category, or tags..."
                                className="w-full h-16 pl-20 pr-5 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-md text-gray-900 placeholder:text-gray-400 shadow-lg shadow-black/3 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10">

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center min-h-[450px] text-center">
                        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-5">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                            Loading events
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Please wait while we fetch the latest events.
                        </p>
                    </div>
                )}

                {/* Error */}
                {!isLoading && error && (
                    <div className="flex flex-col items-center justify-center min-h-[450px] text-center">
                        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Something went wrong
                        </h2>

                        <p className="text-gray-500 max-w-md">
                            {error}
                        </p>
                    </div>
                )}

                {/* Empty */}
                {!isLoading && !error && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[450px] text-center">
                        <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
                            <Inbox className="w-10 h-10 text-gray-500" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {searchQuery ? 'No events match your search' : 'No events yet'}
                        </h2>

                        <p className="text-gray-500 max-w-md">
                            {searchQuery
                                ? 'Try searching with different keywords or categories.'
                                : 'Check back soon for exciting upcoming events.'}
                        </p>
                    </div>
                )}

                {/* Events Grid */}
                {!isLoading && !error && filtered.length > 0 && (
                    <>
                        {/* Results Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                    Available Events
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {filtered.length} Event{filtered.length !== 1 ? 's' : ''} Found
                                </p>
                            </div>

                            {searchQuery && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 border border-brand-100 text-sm text-brand-700 font-medium">
                                    <Search className="w-4 h-4" />
                                    Search: "{searchQuery}"
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                            {filtered.map((event) => (
                                <Link
                                    key={event.slug}
                                    href={`/explore/${event.slug}`}
                                    className="group relative bg-white rounded-[28px] border border-gray-200 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                                >
                                    {/* Event Image */}
                                    <div className="relative w-full h-52 overflow-hidden bg-gray-100">
                                        {event.image ? (
                                            <>
                                                <img
                                                    src={event.image}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-brand-50 to-blue-50">
                                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3">
                                                    <Ticket className="w-8 h-8 text-brand-600" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-500">
                                                    No image available
                                                </p>
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
                                                <span className="truncate">
                                                    {event.organization}
                                                </span>
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
                                                    <p className="font-medium text-gray-900">
                                                        {formatDate(event.start)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Event Date
                                                    </p>
                                                </div>
                                            </div>

                                            {(event.venue || event.city || event.state || event.country) && (
                                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                                                        <MapPin className="w-4 h-4 text-brand-600" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900 line-clamp-2">
                                                            {[
                                                                event.venue,
                                                                event.city,
                                                                event.state,
                                                                event.country,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(', ')}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            Location
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Tags */}
                                        {event.tags && event.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-5">
                                                {event.tags.slice(0, 3).map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 text-xs font-medium"
                                                    >
                                                        <Tag className="w-3 h-3" />
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}