import React, { useState } from 'react';
import { TicketTier } from '@/types/ticket.types';
import { Edit2, Trash2, Ticket, DollarSign, Users, ShoppingCart } from 'lucide-react';
import { ticketService } from '@/api/ticketService';
import DeleteTicketTierModal from './DeleteTicketTierModal';
import Alert from '@/components/ui/alert/Alert';
import TicketTierCard from './TicketTierCard';

interface TicketTierListProps {
    eventId: string;
    ticketTiers: TicketTier[];
    onEdit: (ticketTier: TicketTier) => void;
    onRefresh: () => void;
}

interface AlertConfig {
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    id: number;
}

export default function TicketTierList({ eventId, ticketTiers, onEdit, onRefresh }: TicketTierListProps) {
    const [ticketTierToDelete, setTicketTierToDelete] = useState<TicketTier | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState<AlertConfig | null>(null);
    const [viewingTicketTierId, setViewingTicketTierId] = useState<string | null>(null);

    const confirmDelete = async () => {
        if (!ticketTierToDelete) return;
        setIsDeleting(true);
        try {
            await ticketService.deleteTicketTier(eventId, ticketTierToDelete.id);
            onRefresh();
            setTicketTierToDelete(null);
            setToast({
                variant: 'success',
                title: 'Deleted Successfully',
                message: 'The ticket tier has been removed.',
                id: Date.now()
            });
        } catch (error) {
            setTicketTierToDelete(null);
            setToast({
                variant: 'error',
                title: 'Deletion Failed',
                message: 'Could not delete the ticket tier. Please try again.',
                id: Date.now()
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (!ticketTiers || ticketTiers.length === 0) {
        return (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                <p className="text-gray-500 font-medium">No ticket tiers added yet.</p>
                <p className="text-sm text-gray-400 mt-1">Click "Add Ticket Tier" to start creating tickets for your event.</p>
            </div>
        );
    }

    const sortedTiers = [...ticketTiers].sort((a, b) => a.price - b.price);

    return (
        <>
            <div className="space-y-4">
                {sortedTiers.map((ticketTier) => (
                    <div
                        key={ticketTier.id}
                        onClick={() => setViewingTicketTierId(ticketTier.id)}
                        className="group bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-6 hover:shadow-md transition-all cursor-pointer"
                    >
                        {/* Icon Thumbnail */}
                        <div className="w-16 h-16 shrink-0 rounded-xl bg-brand-50 border border-brand-100/60 flex items-center justify-center">
                            <Ticket className="w-8 h-8 text-brand-400" />
                        </div>

                        {/* Content */}
                        <div className="grow space-y-1.5">
                            <h4 className="text-base font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                                {ticketTier.tierName}
                            </h4>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-500">
                                <div className="flex items-center gap-1.5 text-green-600">
                                    <DollarSign className="w-4 h-4" />
                                    {ticketTier.price.toFixed(2)}
                                </div>
                                <div className="flex items-center gap-1.5 text-blue-600">
                                    <Users className="w-4 h-4" />
                                    {ticketTier.totalCapacity} Total
                                </div>
                                <div className="flex items-center gap-1.5 text-amber-600">
                                    <ShoppingCart className="w-4 h-4" />
                                    {ticketTier.quantitySold} Sold
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 flex items-center gap-2 border-l border-gray-100 pl-4 ml-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(ticketTier); }}
                                className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                title="Edit"
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setTicketTierToDelete(ticketTier); }}
                                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="Delete"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail View Modal */}
            <TicketTierCard
                isOpen={!!viewingTicketTierId}
                onClose={() => setViewingTicketTierId(null)}
                eventId={eventId}
                ticketTierId={viewingTicketTierId}
            />

            {/* Delete Confirmation Modal */}
            <DeleteTicketTierModal
                isOpen={!!ticketTierToDelete}
                onClose={() => !isDeleting && setTicketTierToDelete(null)}
                onConfirm={confirmDelete}
                title={ticketTierToDelete?.tierName || 'this ticket tier'}
                isLoading={isDeleting}
            />

            {/* Toast Alert */}
            {toast && (
                <div className="fixed top-6 right-6 z-99999 w-full max-w-sm drop-shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
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