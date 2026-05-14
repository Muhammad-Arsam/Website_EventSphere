'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventService } from '@/api/eventService';
import { EventResponse } from '@/types/event.types';
import { 
    CalendarDays, 
    MapPin, 
    ArrowLeft, 
    Image as ImageIcon, 
    Clock, 
    Building2, 
    Tag, 
    AlignLeft,
    Globe2,
    CalendarX2,
    Loader2
} from 'lucide-react';
import Button from '@/components/ui/button/Button'; 

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    const [event, setEvent] = useState<EventResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!eventId) return;
            try {
                setIsLoading(true);
                const data = await eventService.getOrgEventById(eventId);
                setEvent(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load event details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvent();
    }, [eventId]);

    // Helpers to format dates precisely
    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(dateString));
    };

    const formatTime = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(new Date(dateString));
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin text-brand-600 mb-4" />
                <span className="text-sm font-medium animate-pulse">Loading event details...</span>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <CalendarX2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
                <p className="text-gray-500 mb-8 max-w-md">{error || "We couldn't find the event you're looking for."}</p>
                <Button onClick={() => router.back()}>Go Back to Events</Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* Header Navigation */}
            <button 
                onClick={() => router.back()} 
                className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors w-fit"
            >
                <div className="p-2 rounded-full bg-white border border-gray-200 shadow-sm group-hover:border-brand-200 group-hover:bg-brand-50 transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                Back to Events
            </button>

            {/* Hero Cover Image - Premium Blurred Backdrop Container */}
            <div className="w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden relative shadow-sm border border-gray-200 bg-white flex items-center justify-center group">
                {event.imageUrl ? (
                    <>
                        {/* Blurred Background Layer */}
                        <div 
                            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30 blur-2xl scale-110"
                            style={{ backgroundImage: `url(${event.imageUrl})` }}
                        />
                        {/* Overlay to ensure the background isn't too distracting */}
                        <div className="absolute inset-0 bg-white/40"></div>
                        
                        {/* Actual Image - fully contained and crisp */}
                        <img 
                            src={event.imageUrl} 
                            alt={event.title} 
                            className="relative z-10 w-full h-full object-contain p-4 md:p-6 drop-shadow-xl transition-transform duration-700 group-hover:scale-105" 
                        />
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                        <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                        <span className="text-sm font-semibold tracking-widest uppercase text-gray-400">No Cover Image</span>
                    </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-6 right-6 z-20 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-sm font-bold shadow-sm ring-1 ring-black/5 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${event.status === 'DRAFT' ? 'bg-amber-400' : 'bg-green-500'}`}></span>
                    {event.status}
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
                
                {/* Left Column: Heavy Content */}
                <div className="lg:col-span-2 space-y-10">
                    
                    {/* Title & Category Header */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider rounded-md border border-brand-100">
                                {event.categoryName || 'Uncategorized'}
                            </span>
                            {event.layoutType && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider rounded-md border border-gray-200">
                                    {event.layoutType}
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
                            {event.title}
                        </h1>
                        <p className="text-lg text-gray-500 font-medium">
                            Organized by <span className="text-gray-900">{event.organizationName || 'Unknown Organization'}</span>
                        </p>
                    </div>

                    {/* Description Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-500"></div>
                        <div className="flex items-center gap-3 mb-6">
                            <AlignLeft className="w-6 h-6 text-brand-600" />
                            <h2 className="text-2xl font-bold text-gray-900">About this event</h2>
                        </div>
                        <div className="prose prose-lg prose-gray max-w-none text-gray-600 leading-relaxed">
                            {event.description && event.description.trim() !== '' ? (
                                <p>{event.description}</p>
                            ) : (
                                <p className="italic text-gray-400">No description has been provided for this event yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Tags Section */}
                    {event.tags && event.tags.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                                <Tag className="w-5 h-5 text-gray-400" />
                                Tags
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {event.tags.map((tag, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-xl border border-gray-200/60 hover:border-gray-300 transition-colors">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Sticky Info Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8 space-y-6">
                        
                        {/* Event Details Card */}
                        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/40 border border-gray-200 overflow-hidden">
                            {/* Card Header */}
                            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900">Event Details</h3>
                                <span className="text-xs font-medium text-gray-500">ID: {event.id.split('-')[0]}</span>
                            </div>
                            
                            {/* Card Body */}
                            <div className="p-6 space-y-8">
                                
                                {/* Date & Time */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                            <CalendarDays className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Starts</p>
                                            <p className="font-bold text-gray-900">{formatDate(event.startDateTime)}</p>
                                            <p className="text-gray-600 mt-0.5 flex items-center gap-1.5 text-sm">
                                                <Clock className="w-4 h-4 text-gray-400" /> {formatTime(event.startDateTime)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                                            <CalendarDays className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Ends</p>
                                            <p className="font-bold text-gray-900">{formatDate(event.endDateTime)}</p>
                                            <p className="text-gray-600 mt-0.5 flex items-center gap-1.5 text-sm">
                                                <Clock className="w-4 h-4 text-gray-400" /> {formatTime(event.endDateTime)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Location with OSM Map */}
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1 grow">
                                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                                            <p className="font-bold text-gray-900">{event.venue || 'Venue TBA'}</p>
                                            <div className="text-gray-600 text-sm space-y-1 mt-2">
                                                {event.address && <p className="flex items-start gap-2"><Building2 className="w-4 h-4 shrink-0 mt-0.5" /> {event.address}</p>}
                                                <p className="flex items-center gap-2"><Globe2 className="w-4 h-4 shrink-0" /> {[event.city, event.state, event.country].filter(Boolean).join(', ')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* OSM Map Iframe */}
                                    {event.lat && event.lon ? (
                                        <div className="w-full h-40 rounded-2xl overflow-hidden ring-2 ring-gray-100 ring-offset-2 ring-offset-gray-50 border border-emerald-100 shadow-inner">
                                            <iframe
                                                title="OSM Map"
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                scrolling="no"
                                                marginHeight={0}
                                                marginWidth={0}
                                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${event.lon-0.01},${event.lat-0.01},${event.lon+0.01},${event.lat+0.01}&layer=mapnik&marker=${event.lat},${event.lon}`}
                                                className="w-full h-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-40 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400">
                                            <MapPin className="w-8 h-8 mb-3 opacity-30" />
                                            <p className="text-sm">Location Map TBA</p>
                                            <p className="text-xs">Provide coordinates in the Edit form.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* System Info */}
                        <div className="px-4 text-xs text-center text-gray-400 space-y-1">
                            {event.createdAt && <p>Created: {new Date(event.createdAt).toLocaleDateString()}</p>}
                            {event.modifiedAt && <p>Last modified: {new Date(event.modifiedAt).toLocaleDateString()}</p>}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}