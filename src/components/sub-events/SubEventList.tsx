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
            <div className="space-y-4">
                {sortedEvents.map((subEvent) => (
                    <div 
                        key={subEvent.id} 
                        onClick={() => setViewingSubEventId(subEvent.id)}
                        className="group bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-6 hover:shadow-md transition-all cursor-pointer"
                    >
                        
                        {/* Thumbnail */}
                        <div className="w-24 h-24 shrink-0 rounded-xl bg-gray-100 overflow-hidden border border-gray-200/60 flex items-center justify-center relative">
                            {subEvent.imageUrl ? (
                                <img src={subEvent.imageUrl} alt={subEvent.title} className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-gray-300" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="grow space-y-2">
                            <h4 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                {subEvent.title}
                            </h4>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-emerald-500" />
                                    {formatTimeRange(subEvent.startTime, subEvent.endTime)}
                                </div>
                                
                                {subEvent.roomOrLocation && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-emerald-500" />
                                        {subEvent.roomOrLocation}
                                    </div>
                                )}
                                
                                {subEvent.capacityLimit && (
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        {subEvent.capacityLimit} max
                                    </div>
                                )}
                            </div>

                            {subEvent.description && (
                                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                                    {subEvent.description}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 flex items-center gap-2 border-l border-gray-100 pl-4 ml-2">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(subEvent);
                                }}
                                className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                title="Edit"
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSubEventToDelete(subEvent);
                                }}
                                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="Delete"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
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