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
            <div className="space-y-5">
                {sortedTiers.map((ticketTier) => {
                    const soldPercentage =
                        ticketTier.totalCapacity > 0
                            ? (ticketTier.quantitySold / ticketTier.totalCapacity) * 100
                            : 0;

                    const remainingTickets =
                        ticketTier.totalCapacity - ticketTier.quantitySold;

                    const isSoldOut =
                        ticketTier.quantitySold >= ticketTier.totalCapacity;

                    return (
                        <div
                            key={ticketTier.id}
                            onClick={() => setViewingTicketTierId(ticketTier.id)}
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
                            <div className="absolute left-0 top-0 h-full w-1.5 bg-linear-to-b from-brand-500 to-brand-300" />

                            {/* Ticket Cutouts */}
                            <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-gray-50 border border-gray-100" />
                            <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-gray-50 border border-gray-100" />

                            <div className="flex items-start gap-5">
                                {/* Icon */}
                                <div className="shrink-0">
                                    <div
                                        className="
                                w-16 h-16
                                rounded-2xl
                                bg-linear-to-br
                                from-brand-50
                                to-brand-100
                                border border-brand-100
                                shadow-sm
                                flex items-center justify-center
                            "
                                    >
                                        <Ticket className="w-8 h-8 text-brand-500" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h4
                                                    className="
                                            text-lg
                                            font-bold
                                            text-gray-900
                                            group-hover:text-brand-600
                                            transition-colors
                                        "
                                                >
                                                    {ticketTier.tierName}
                                                </h4>

                                                {isSoldOut && (
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                                                        SOLD OUT
                                                    </span>
                                                )}
                                            </div>

                                            {/* <p className="text-sm text-gray-400 mt-1">
                                                Event Ticket Tier
                                            </p> */}
                                        </div>

                                        <div className="px-4 py-2 rounded-2xl bg-green-50 border border-green-100">
                                            <div className="flex items-center gap-1 text-green-700">
                                                {/* <DollarSign className="w-4 h-4" /> */}
                                                <span className="font-bold text-lg">
                                                   Rs. {ticketTier.price.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-3 mt-5">
                                        <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3">
                                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                                <Users className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase">
                                                    Capacity
                                                </span>
                                            </div>

                                            <div className="font-bold text-lg text-gray-900">
                                                {ticketTier.totalCapacity}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3">
                                            <div className="flex items-center gap-2 text-amber-600 mb-1">
                                                <ShoppingCart className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase">
                                                    Sold
                                                </span>
                                            </div>

                                            <div className="font-bold text-lg text-gray-900">
                                                {ticketTier.quantitySold}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                                            <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                                <Ticket className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase">
                                                    Left
                                                </span>
                                            </div>

                                            <div className="font-bold text-lg text-gray-900">
                                                {remainingTickets}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="mt-5">
                                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                                            <span>Sales Progress</span>
                                            <span>{Math.round(soldPercentage)}%</span>
                                        </div>

                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="
                                        h-full
                                        rounded-full
                                        bg-linear-to-r
                                        from-brand-500
                                        to-brand-400
                                        transition-all duration-500
                                    "
                                                style={{
                                                    width: `${Math.min(
                                                        soldPercentage,
                                                        100
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
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
                                            onEdit(ticketTier);
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
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setTicketTierToDelete(ticketTier);
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
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
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