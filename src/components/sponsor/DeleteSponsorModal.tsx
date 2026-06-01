'use client';

import React, { useState } from 'react';
import { Trash2, X, Loader2, AlertTriangle } from 'lucide-react';
import { sponsorService } from '@/api/sponsorService';
import { Sponsor } from '@/types/sponsor.types';

interface DeleteSponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  sponsor: Sponsor | null;
  onSuccess: () => void;
  showAlert: (variant: 'success' | 'error', title: string, message: string) => void;
}

export default function DeleteSponsorModal({
  isOpen, onClose, eventId, sponsor, onSuccess, showAlert,
}: DeleteSponsorModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !sponsor) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await sponsorService.deleteSponsor(eventId, sponsor.id);
      showAlert('success', 'Sponsor Removed', `"${sponsor.name}" has been removed from this event.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      showAlert('error', 'Delete Failed', err.message || 'Failed to remove sponsor.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Remove Sponsor</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium leading-snug">
              This action cannot be undone. The sponsor will be permanently removed from this event.
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Are you sure you want to remove{' '}
            <span className="font-bold text-gray-900">{sponsor.name}</span> as a sponsor?
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isDeleting ? 'Removing...' : 'Remove Sponsor'}
          </button>
        </div>
      </div>
    </div>
  );
}