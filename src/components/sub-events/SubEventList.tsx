import React, { useState } from 'react';
import { SubEvent } from '@/types/event.types';
import { Edit2, Trash2, Clock, Image as ImageIcon, MapPin, Users } from 'lucide-react';
import { eventService } from '@/api/eventService';
import DeleteSubEventModal from '@/components/sub-events/DeleteSubEventModal';
import Alert from '@/components/ui/alert/Alert';
import SubEventCard from './SubEventCard'; // Adjust this import path as needed

interface SubEventListProps {
    eventId: string;
    subEvents: SubEvent[];
    onEdit: (subEvent: SubEvent) => void;
    onRefresh: () => void;
}

interface AlertConfig {
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    id: number;
}

export default function SubEventList({ eventId, subEvents, onEdit, onRefresh }: SubEventListProps) {
    // State for managing the delete modal
    const [subEventToDelete, setSubEventToDelete] = useState<SubEvent | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State for managing the toast alert
    const [toast, setToast] = useState<AlertConfig | null>(null);

    // State for viewing sub-event details
    const [viewingSubEventId, setViewingSubEventId] = useState<string | null>(null);

    const confirmDelete = async () => {
        if (!subEventToDelete) return;

        setIsDeleting(true);
        try {
            await eventService.deleteSubEvent(eventId, subEventToDelete.id);
            onRefresh();
            setSubEventToDelete(null);

            setToast({
                variant: 'success',
                title: 'Deleted Successfully',
                message: 'The agenda item has been removed.',
                id: Date.now()
            });
        } catch (error) {
            setSubEventToDelete(null);

            setToast({
                variant: 'error',
                title: 'Deletion Failed',
                message: 'Could not delete the sub-event. Please try again.',
                id: Date.now()
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const formatTimeRange = (start: string, end: string) => {
        const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
        const startTime = new Intl.DateTimeFormat('en-US', timeOptions).format(new Date(start));
        const endTime = new Intl.DateTimeFormat('en-US', timeOptions).format(new Date(end));
        return `${startTime} - ${endTime}`;
    };

    if (!subEvents || subEvents.length === 0) {
        return (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                <p className="text-gray-500 font-medium">No sub-events added yet.</p>
                <p className="text-sm text-gray-400 mt-1">Click "Add Sub-Event" to start building your agenda.</p>
            </div>
        );
    }

    // Sort chronologically
    const sortedEvents = [...subEvents].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return (
        <>
            <div className="space-y-5">
                {sortedEvents.map((subEvent) => (
                    <div
                        key={subEvent.id}
                        onClick={() => setViewingSubEventId(subEvent.id)}
                        className="
            relative overflow-hidden
            rounded-3xl
            border border-gray-100
            bg-white
            p-5
            shadow-sm
            hover:shadow-xl
            hover:-translate-y-1
            transition-all duration-300
            cursor-pointer
            group
        "
                    >
                        {/* Accent Line */}
                        <div className="absolute left-0 top-0 h-full w-1.5 bg-linear-to-b from-emerald-500 to-emerald-300" />

                        <div className="flex gap-5">

                            {/* Image */}
                            <div className="shrink-0">
                                <div
                                    className="
                        w-24 h-24
                        rounded-2xl
                        overflow-hidden
                        border border-gray-100
                        bg-gray-50
                        shadow-sm
                    "
                                >
                                    {subEvent.imageUrl ? (
                                        <img
                                            src={subEvent.imageUrl}
                                            alt={subEvent.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">

                                {/* Header */}
                                <div className="flex flex-wrap justify-between gap-4">
                                    <div>
                                        <h4
                                            className="
                                text-lg
                                font-bold
                                text-gray-900
                                group-hover:text-emerald-600
                                transition-colors
                            "
                                        >
                                            {subEvent.title}
                                        </h4>

                                        {/* <p className="text-sm text-gray-400 mt-1">
                                            Agenda Item
                                        </p> */}
                                    </div>

                                    {/* Time Badge */}
                                    <div
                                        className="
                            px-4 py-2
                            rounded-2xl
                            bg-emerald-50
                            border border-emerald-100
                            text-emerald-700
                            font-semibold
                            text-sm
                            flex items-center gap-2
                            h-fit
                        "
                                    >
                                        <Clock className="w-4 h-4" />
                                        {formatTimeRange(
                                            subEvent.startTime,
                                            subEvent.endTime
                                        )}
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="grid grid-cols-2 gap-3 mt-5">

                                    {subEvent.roomOrLocation && (
                                        <div
                                            className="
                                rounded-2xl
                                bg-blue-50
                                border border-blue-100
                                px-4 py-3
                            "
                                        >
                                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase tracking-wide">
                                                    Location
                                                </span>
                                            </div>

                                            <div className="font-semibold text-gray-900 truncate">
                                                {subEvent.roomOrLocation}
                                            </div>
                                        </div>
                                    )}

                                    {subEvent.capacityLimit && (
                                        <div
                                            className="
                                rounded-2xl
                                bg-purple-50
                                border border-purple-100
                                px-4 py-3
                            "
                                        >
                                            <div className="flex items-center gap-2 text-purple-600 mb-1">
                                                <Users className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase tracking-wide">
                                                    Capacity
                                                </span>
                                            </div>

                                            <div className="font-semibold text-gray-900">
                                                {subEvent.capacityLimit} Attendees
                                            </div>
                                        </div>
                                    )}

                                </div>

                                {/* Description */}
                                {subEvent.description && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                            {subEvent.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div
                                className="
                    flex flex-col gap-2
                    opacity-0
                    group-hover:opacity-100
                    transition-all duration-200
                "
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(subEvent);
                                    }}
                                    className="
                        p-3
                        rounded-2xl
                        bg-blue-50
                        text-blue-600
                        hover:bg-blue-100
                        hover:scale-105
                        transition-all
                    "
                                    title="Edit Sub Event"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSubEventToDelete(subEvent);
                                    }}
                                    className="
                        p-3
                        rounded-2xl
                        bg-red-50
                        text-red-500
                        hover:bg-red-100
                        hover:scale-105
                        transition-all
                    "
                                    title="Delete Sub Event"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Render the Details Modal */}
            <SubEventCard
                isOpen={!!viewingSubEventId}
                onClose={() => setViewingSubEventId(null)}
                subEventId={viewingSubEventId}
            />

            {/* Render the Delete Confirmation Modal */}
            <DeleteSubEventModal
                isOpen={!!subEventToDelete}
                onClose={() => !isDeleting && setSubEventToDelete(null)}
                onConfirm={confirmDelete}
                title={subEventToDelete?.title || 'this item'}
                isLoading={isDeleting}
            />

            {/* Render the Toast Alert */}
            {toast && (
                <div className="relative z-99999">
                    <Alert
                        key={toast.id}
                        variant={toast.variant}
                        title={toast.title}
                        message={toast.message}
                    />
                </div>
            )}
        </>
    );
}