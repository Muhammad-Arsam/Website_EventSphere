'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EventResponse } from '@/types/event.types';
import { Calendar, MapPin, Image as ImageIcon, Pencil } from 'lucide-react';
import EditEventForm from './EditEventForm'; 

interface EventCardProps {
    event: EventResponse;
}

export default function EventCard({ event }: EventCardProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const formattedDate = new Date(event.startDateTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <>
            <div className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-gray-300">
                
                {/* Clickable Area navigating to Event Details Page */}
                <Link href={`/events/${event.id}`} className="flex flex-col grow cursor-pointer">
                    {/* Top Banner Image */}
                    <div className="relative h-48 w-full bg-gray-50/50 flex items-center justify-center overflow-hidden border-b border-gray-100">
                        {event.imageUrl ? (
                            <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            // Placeholder if no image
                            <div className="flex flex-col items-center justify-center text-gray-400 transition-transform duration-500 group-hover:scale-105">
                                <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
                                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">No Banner</span>
                            </div>
                        )}
                        {/* Subtle gradient overlay that appears on hover for a premium feel */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Card Body */}
                    <div className="p-5 grow flex flex-col">
                        <h3 className="font-bold text-gray-900 text-xl leading-snug line-clamp-2 mb-5 transition-colors group-hover:text-brand-600">
                            {event.title}
                        </h3>

                        {/* Details Grid */}
                        <div className="grid gap-3 mt-auto">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                </div>
                                <span className="font-medium">{formattedDate}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                </div>
                                <span className="font-medium truncate">{event.venue || event.city || 'Location TBA'}</span>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Footer / Action (Outside of Link to prevent routing conflicts) */}
                <div className="px-5 pb-5 pt-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault(); // Extra safety to ensure no link bubbling
                            setIsEditModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 relative z-10"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit Event
                    </button>
                </div>
            </div>

            {/* Conditionally render the modal to prevent phantom DOM height and improve performance */}
            {isEditModalOpen && (
                <EditEventForm
                    isOpen={isEditModalOpen}
                    closeModal={() => setIsEditModalOpen(false)}
                    event={event}
                />
            )}
        </>
    );
}