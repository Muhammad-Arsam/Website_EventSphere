'use client';

import React, { useState } from 'react';
import { EventResponse } from '@/types/event.types';
import { Calendar, MapPin, Image as ImageIcon, Pencil } from 'lucide-react';
import EditEventForm from './EditEventForm'; // Import your newly created modal component

interface EventCardProps {
    event: EventResponse;
}

export default function EventCard({ event }: EventCardProps) {
    // State to control the visibility of the Edit Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const formattedDate = new Date(event.startDateTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-md">
                {/* Top Banner Image */}
                <div className="h-40 w-full bg-gray-50 relative border-b border-gray-100 flex items-center justify-center overflow-hidden">
                    {event.imageUrl ? (
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        // Placeholder if no image (like Drafts)
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-xs font-medium uppercase tracking-wider">No Banner</span>
                        </div>
                    )}
                </div>

                {/* Card Body */}
                <div className="p-5 grow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2 pr-2">
                            {event.title}
                        </h3>

                        {/* Status Badge */}
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${event.status === 'DRAFT'
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-green-50 text-green-700'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${event.status === 'DRAFT' ? 'bg-gray-400' : 'bg-green-500'}`}></span>
                            {event.status}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid gap-3 mt-auto">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{event.venue || event.city || 'Location TBA'}</span>
                        </div>
                    </div>
                </div>

                {/* Footer / Action */}
                <div className="p-4 border-t border-gray-50 flex justify-end">
                    {/* Changed from <Link> to <button> to trigger the modal state */}
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit Event
                    </button>
                </div>
            </div>

            {/* Render the Edit Modal outside the visual card box */}
            <EditEventForm
                isOpen={isEditModalOpen}
                closeModal={() => setIsEditModalOpen(false)}
                event={event}
            />
        </>
    );
}