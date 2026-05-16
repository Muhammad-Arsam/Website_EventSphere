import React, { useState, useEffect } from 'react';
import {
    X,
    Loader2,
    Ticket,
    DollarSign,
    Users,
    Tag
} from 'lucide-react';
import Button from '@/components/ui/button/Button';
import Alert from '@/components/ui/alert/Alert';
import { TicketTier, TicketTierPayload } from '@/types/ticket.types';
import { ticketService } from '@/api/ticketService';

interface TicketTierModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string;
    existingTicketTier?: TicketTier | null; // ✅ Matches page.tsx
    onSuccess: () => void;
}

export default function TicketTierModal({ isOpen, onClose, eventId, existingTicketTier, onSuccess }: TicketTierModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const [alertConfig, setAlertConfig] = useState<{
        id: number;
        variant: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
    } | null>(null);

    const [tierName, setTierName] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [totalCapacity, setTotalCapacity] = useState<number | ''>('');

    const showAlert = (variant: 'success' | 'error', title: string, message: string) => {
        setAlertConfig({ id: Date.now(), variant, title, message });
    };

    useEffect(() => {
        if (existingTicketTier && isOpen) {
            setTierName(existingTicketTier.tierName || '');
            setPrice(existingTicketTier.price);
            setTotalCapacity(existingTicketTier.totalCapacity);
        } else if (isOpen) {
            setTierName('');
            setPrice('');
            setTotalCapacity('');
        }

        if (isOpen) {
            setAlertConfig(null);
            setIsLoading(false);
        }
    }, [existingTicketTier, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAlertConfig(null);
        setIsLoading(true);

        const payload: TicketTierPayload = {
            tierName,
            price: Number(price),
            totalCapacity: Number(totalCapacity),
        };

        try {
            if (existingTicketTier) {
                await ticketService.updateTicketTier(eventId, existingTicketTier.id, payload);
                showAlert('success', 'Updated!', 'Ticket tier updated successfully.');
            } else {
                await ticketService.addTicketTier(eventId, payload);
                showAlert('success', 'Created!', 'Ticket tier created successfully.');
            }

            setTimeout(() => {
                onSuccess();
                onClose();
                setIsLoading(false);
            }, 1000);

        } catch (err: any) {
            showAlert('error', 'Save Failed', err.message || 'Something went wrong.');
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Alert Container */}
            {alertConfig && (
                <div className="fixed top-6 right-6 z-999999 w-full max-w-sm drop-shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <Alert
                        key={alertConfig.id}
                        variant={alertConfig.variant}
                        title={alertConfig.title}
                        message={alertConfig.message}
                    />
                </div>
            )}

            <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col relative">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <Ticket className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {existingTicketTier ? 'Edit Ticket Tier' : 'Add Ticket Tier'}
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form Body */}
                    <div className="p-6 bg-white">
                        <form id="ticket-tier-form" onSubmit={handleSubmit} className="space-y-5">

                            {/* Tier Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Tier Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Tag className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text" required value={tierName}
                                        onChange={(e) => setTierName(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all outline-none hover:border-gray-400"
                                        placeholder="e.g., Early Bird, VIP, General"
                                    />
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Price <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number" step="0.01" min="0" required
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all outline-none hover:border-gray-400"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className="text-[11px] text-gray-500 mt-1.5">Set to 0 for free tickets.</p>
                            </div>

                            {/* Capacity */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Total Capacity <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Users className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number" min="1" required
                                        value={totalCapacity}
                                        onChange={(e) => setTotalCapacity(e.target.value ? Number(e.target.value) : '')}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all outline-none hover:border-gray-400"
                                        placeholder="e.g., 100"
                                    />
                                </div>
                            </div>

                        </form>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            variant="outline"
                            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="ticket-tier-form"
                            disabled={isLoading}
                            className="min-w-[120px] bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                existingTicketTier ? 'Update Tier' : 'Save Tier'
                            )}
                        </Button>
                    </div>

                </div>
            </div>
        </>
    );
}