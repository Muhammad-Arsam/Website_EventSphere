import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/button/Button';

interface DeleteSubEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    isLoading: boolean;
}

export default function DeleteSubEventModal({ isOpen, onClose, onConfirm, title, isLoading }: DeleteSubEventModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        <h2 className="text-xl font-bold text-gray-900">Delete Sub-Event</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 bg-white">
                    <p className="text-gray-600">
                        Are you sure you want to delete <span className="font-semibold text-gray-900">"{title}"</span>? 
                        This action cannot be undone and will permanently remove this item from the agenda.
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <Button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="min-w-[100px] bg-red-600 hover:bg-red-700 text-white border-transparent"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Deleting...
                            </>
                        ) : (
                            'Delete'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}