import React, { useState, useEffect } from 'react';
import { TicketTier } from '@/types/ticket.types';
import { ticketService } from '@/api/ticketService';
import {
    X,
    Users,
    Loader2,
    Ticket,
    History,
    XCircle,
    DollarSign,
    ShoppingCart,
    Tag
} from 'lucide-react';
import Button from '@/components/ui/button/Button';

interface TicketTierCardProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string | null;
    ticketTierId: string | null;
}

export default function TicketTierCard({ isOpen, onClose, eventId, ticketTierId }: TicketTierCardProps) {
    const [ticketTier, setTicketTier] = useState<TicketTier | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && eventId && ticketTierId) {
            const fetchTicketTierDetails = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const data = await ticketService.getTicketTierById(ticketTierId);
                    setTicketTier(data);
                } catch (err: any) {
                    setError(err.message || 'Failed to load ticket tier details.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchTicketTierDetails();
        } else {
            setTicketTier(null);
            setError(null);
        }
    }, [isOpen, eventId, ticketTierId]);

    const formatDateTime = (dateString: string) => {
        try {
            return new Intl.DateTimeFormat('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).format(new Date(dateString));
        } catch {
            return dateString;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 sm:p-6 bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-4xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300 max-h-[92vh] border border-gray-100">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 z-20 p-2.5 bg-white/60 backdrop-blur-lg text-gray-700 hover:text-gray-950 hover:bg-white rounded-full shadow-md transition-all border border-gray-200/50"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-32 space-y-5 bg-gray-50/50">
                        <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
                        <p className="text-gray-600 font-semibold text-lg animate-pulse">Fetching ticket details...</p>
                    </div>
                )}

                {/* Error */}
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

                {/* Content */}
                {!isLoading && !error && ticketTier && (
                    <div className="overflow-y-auto custom-scrollbar flex flex-col h-full">

                        {/* Header */}
                        <div className="px-8 pt-12 pb-6 border-b border-gray-100 shrink-0 bg-gray-50/50">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider border border-brand-100 mb-4">
                                <Ticket className="w-4 h-4" /> Ticket Tier
                            </span>
                            <h2 className="text-4xl font-extrabold text-gray-950 pr-14 leading-tight tracking-tighter">
                                {ticketTier.tierName}
                            </h2>
                        </div>

                        {/* Info Grid */}
                        <div className="p-8 grow">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                {/* Price */}
                                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1.5">Price</p>
                                        <p className="text-xl font-semibold text-green-950">${ticketTier.price.toFixed(2)}</p>
                                    </div>
                                </div>

                                {/* Total Capacity */}
                                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1.5">Total Capacity</p>
                                        <p className="text-xl font-semibold text-blue-950">{ticketTier.totalCapacity} Tickets</p>
                                    </div>
                                </div>

                                {/* Quantity Sold */}
                                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">
                                        <ShoppingCart className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1.5">Quantity Sold</p>
                                        <p className="text-xl font-semibold text-brand-950">{ticketTier.quantitySold}</p>
                                    </div>
                                </div>

                                {/* Remaining */}
                                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                                        <Tag className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1.5">Remaining</p>
                                        <p className="text-xl font-semibold text-amber-950">
                                            {Math.max(0, ticketTier.totalCapacity - ticketTier.quantitySold)}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Metadata Footer */}
                        <div className="bg-gray-100/70 border-t border-gray-200/70 p-8 shrink-0 space-y-4 rounded-b-4xl">
                            <h5 className="text-xs font-bold text-gray-900 uppercase tracking-widest">System Information</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 text-[11px] text-gray-500">
                                {ticketTier.createdAt && (
                                    <div className="flex items-center gap-2.5 bg-white/70 p-2 rounded-lg border border-gray-200/50">
                                        <History className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="font-semibold text-gray-700">Created:</span>
                                        <span className="truncate text-gray-800">{formatDateTime(ticketTier.createdAt)}</span>
                                    </div>
                                )}
                                {ticketTier.modifiedAt && (
                                    <div className="flex items-center gap-2.5 bg-white/70 p-2 rounded-lg border border-gray-200/50">
                                        <History className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="font-semibold text-gray-700">Modified:</span>
                                        <span className="truncate text-gray-800">{formatDateTime(ticketTier.modifiedAt)}</span>
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