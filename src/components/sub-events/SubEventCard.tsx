import React, { useState, useEffect } from 'react';
import { SubEvent } from '@/types/event.types';
import { eventService } from '@/api/eventService';
import { 
    X, 
    Clock, 
    MapPin, 
    Users, 
    AlignLeft, 
    Loader2, 
    Calendar,
    ShieldAlert,
    User,
    History,
    Hash,
    XCircle
} from 'lucide-react';
import Button from '@/components/ui/button/Button';

interface SubEventCardProps {
    isOpen: boolean;
    onClose: () => void;
    subEventId: string | null;
}

export default function SubEventCard({ isOpen, onClose, subEventId }: SubEventCardProps) {
    const [subEvent, setSubEvent] = useState<SubEvent | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && subEventId) {
            const fetchSubEventDetails = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const data = await eventService.getSubEventById(subEventId);
                    setSubEvent(data);
                } catch (err: any) {
                    setError(err.message || 'Failed to load sub-event details.');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchSubEventDetails();
        } else {
            setSubEvent(null);
            setError(null);
        }
    }, [isOpen, subEventId]);

    const formatDateTime = (dateString: string) => {
        try {
            const options: Intl.DateTimeFormatOptions = { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            };
            return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
        } catch {
            return dateString;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 sm:p-6 bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-4xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300 max-h-[92vh] border border-gray-100">
                
                {/* Close Button - Floats nicely in top right */}
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 z-20 p-2.5 bg-white/60 backdrop-blur-lg text-gray-700 hover:text-gray-950 hover:bg-white rounded-full shadow-md transition-all border border-white/20"
                >
                    <X className="w-5 h-5" />
                </button>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-32 space-y-5 bg-gray-50/50">
                        <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
                        <p className="text-gray-600 font-semibold text-lg animate-pulse">Fetching session details...</p>
                    </div>
                )}

                {!isLoading && error && (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4 px-8 text-center bg-gray-50/50">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 border-4 border-red-50">
                            <XCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-950">Unable to Load</h3>
                        <p className="text-gray-600 max-w-sm leading-relaxed">{error}</p>
                        <Button onClick={onClose} className="mt-6">Close Window</Button>
                    </div>
                )}

                {!isLoading && !error && subEvent && (
                    <div className="overflow-y-auto custom-scrollbar flex flex-col h-full">
                        
                        {/* Beautiful Image Header Section */}
                        {subEvent.imageUrl ? (
                            <div className="w-full aspect-video relative bg-gray-950 shrink-0 overflow-hidden border-b border-gray-100">
                                {/* 1. Blurred Background Layer (handles portrait/square images perfectly) */}
                                <img 
                                    src={subEvent.imageUrl} 
                                    alt="Background Blur" 
                                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40 saturate-50"
                                />
                                
                                {/* 2. Main Image Layer (object-contain ensures it looks "complete") */}
                                <div className="absolute inset-0 p-6 flex items-center justify-center">
                                    <img 
                                        src={subEvent.imageUrl} 
                                        alt={subEvent.title} 
                                        className="relative z-10 max-w-full max-h-full rounded-xl object-contain shadow-2xl drop-shadow-xl border border-white/10"
                                    />
                                </div>
                                
                                {/* 3. Subtle Bottom Gradient for Title Readability (if implemented later) */}
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/50 to-transparent z-10" />
                            </div>
                        ) : (
                            // Fallback if no image exists
                            <div className="px-8 pt-12 pb-6 border-b border-gray-100 shrink-0 bg-gray-50/50">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider border border-brand-100 mb-4">
                                    Agenda Item
                                </span>
                                <h2 className="text-4xl font-extrabold text-gray-950 pr-14 leading-tight tracking-tighter">
                                    {subEvent.title}
                                </h2>
                            </div>
                        )}

                        {/* Title Section (Moved outside image for portrait consistency, unless you prefer it overlaid) */}
                        {subEvent.imageUrl && (
                            <div className="px-8 pt-8 pb-2 shrink-0">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider border border-brand-100 mb-4">
                                    Agenda Item
                                </span>
                                <h2 className="text-4xl font-extrabold text-gray-950 pr-14 leading-tight tracking-tighter">
                                    {subEvent.title}
                                </h2>
                            </div>
                        )}

                        {/* Details Body */}
                        <div className="p-8 space-y-10 grow">
                            
                            {/* Premium Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 border border-gray-200/50">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Start Time</p>
                                        <p className="text-base font-semibold text-gray-950 leading-snug">{formatDateTime(subEvent.startTime)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 border border-gray-200/50">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">End Time</p>
                                        <p className="text-base font-semibold text-gray-950 leading-snug">{formatDateTime(subEvent.endTime)}</p>
                                    </div>
                                </div>
                                
                                {subEvent.roomOrLocation && (
                                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1.5">Location / Room</p>
                                            <p className="text-base font-semibold text-emerald-950 leading-snug">{subEvent.roomOrLocation}</p>
                                        </div>
                                    </div>
                                )}

                                {subEvent.capacityLimit !== undefined && subEvent.capacityLimit !== null && (
                                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1.5">Capacity Limit</p>
                                            <p className="text-base font-semibold text-blue-950 leading-snug">{subEvent.capacityLimit} Attendees Max</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description Section */}
                            {subEvent.description && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-950 font-bold text-xl tracking-tight">
                                        <AlignLeft className="w-6 h-6 text-gray-400" />
                                        <h3>Session Description</h3>
                                    </div>
                                    <div className="prose prose-md max-w-none text-gray-700 leading-relaxed bg-gray-50/50 rounded-2xl p-6 border border-gray-100 shadow-inner">
                                        <p className="whitespace-pre-wrap">{subEvent.description}</p>
                                    </div>
                                </div>
                            )}

                            {/* Rules & Config Section */}
                            {subEvent.rulesConfig && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-950 font-bold text-xl tracking-tight">
                                        <ShieldAlert className="w-6 h-6 text-amber-500" />
                                        <h3>Important Guidelines & Rules</h3>
                                    </div>
                                    <div className="prose prose-sm max-w-none text-amber-950 leading-relaxed bg-amber-50/50 rounded-2xl p-6 border border-amber-100 shadow-inner">
                                        <p className="whitespace-pre-wrap">{subEvent.rulesConfig}</p>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Premium Metadata Footer */}
                        <div className="bg-gray-100/70 border-t border-gray-200/70 p-8 shrink-0 text-[11px] text-gray-500 space-y-4 rounded-b-4xl">
                            <h5 className="text-xs font-bold text-gray-900 uppercase tracking-widest">System Information</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                                {/* <div className="flex items-center gap-2.5 bg-white/70 p-2 rounded-lg border border-gray-200/50">
                                    <Hash className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="font-semibold text-gray-700">Sub-Event ID:</span> 
                                    <span className="truncate font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{subEvent.id}</span>
                                </div>
                                <div className="flex items-center gap-2.5 bg-white/70 p-2 rounded-lg border border-gray-200/50">
                                    <Hash className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="font-semibold text-gray-700">Parent ID:</span> 
                                    <span className="truncate font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{subEvent.eventId}</span>
                                </div> */}
                                
                                {/* {subEvent.createdBy && (
                                    <div className="flex items-center gap-2.5 bg-white/70 p-2 rounded-lg border border-gray-200/50">
                                        <User className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="font-semibold text-gray-700">Created By:</span> 
                                        <span className="truncate text-gray-800">{subEvent.createdBy}</span>
                                    </div>
                                )} */}
                                {subEvent.createdAt && (
                                    <div className="flex items-center gap-2.5 bg-white/70 p-2 rounded-lg border border-gray-200/50">
                                        <History className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="font-semibold text-gray-700">Created At:</span> 
                                        <span className="truncate text-gray-800">{formatDateTime(subEvent.createdAt)}</span>
                                    </div>
                                )}
                                
                                {/* {subEvent.modifiedBy && (
                                    <div className="flex items-center gap-2.5 bg-white/70 p-2 rounded-lg border border-gray-200/50">
                                        <User className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="font-semibold text-gray-700">Last Modified By:</span> 
                                        <span className="truncate text-gray-800">{subEvent.modifiedBy}</span>
                                    </div>
                                )} */}
                                {subEvent.modifiedAt && (
                                    <div className="flex items-center gap-2.5 bg-white/70 p-2 rounded-lg border border-gray-200/50">
                                        <History className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="font-semibold text-gray-700">Last Modified At:</span> 
                                        <span className="truncate text-gray-800">{formatDateTime(subEvent.modifiedAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}