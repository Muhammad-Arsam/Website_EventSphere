'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Building2, Plus, Loader2 } from 'lucide-react';
import { sponsorService } from '@/api/sponsorService';
import { Sponsor } from '@/types/sponsor.types';
import SponsorList from '@/components/sponsor/SponsorList';
import AddSponsorModal from '@/components/sponsor/AddSponsorModal';
import DeleteSponsorModal from '@/components/sponsor/DeleteSponsorModal';
import Alert from '@/components/ui/alert/Alert';
import Button from '@/components/ui/button/Button';

interface SponsorTabProps {
  eventId: string;
}

export default function SponsorTab({ eventId }: SponsorTabProps) {
  const [sponsors, setSponsors]               = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading]             = useState(false);
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [deletingSponsor, setDeletingSponsor] = useState<Sponsor | null>(null);
  const [isDeleteOpen, setIsDeleteOpen]       = useState(false);
  const [alert, setAlert]                     = useState<{
    variant: 'success' | 'error'; title: string; message: string;
  } | null>(null);

  const showAlert = useCallback((variant: 'success' | 'error', title: string, message: string) => {
    setAlert({ variant, title, message });
    setTimeout(() => setAlert(null), 3500);
  }, []);

  const fetchSponsors = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await sponsorService.getSponsors(eventId);
      setSponsors(data);
    } catch (err: any) {
      showAlert('error', 'Load Failed', err.message || 'Failed to load sponsors.');
    } finally {
      setIsLoading(false);
    }
  }, [eventId, showAlert]);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  const handleDeleteRequest = (sponsor: Sponsor) => {
    setDeletingSponsor(sponsor);
    setIsDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setIsDeleteOpen(false);
    setDeletingSponsor(null);
  };

  // Summary stats
  const tierCounts = sponsors.reduce<Record<string, number>>((acc, s) => {
    const tier = s.sponsorTier ?? 'OTHER';
    acc[tier] = (acc[tier] ?? 0) + 1;
    return acc;
  }, {});

  const platinumCount = tierCounts['PLATINUM'] ?? 0;
  const goldCount     = tierCounts['GOLD']     ?? 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

      {/* Alert toast */}
      {alert && (
        <div className="fixed top-6 right-6 z-99999 w-full max-w-sm drop-shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <Alert
            key={alert.title}
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
          />
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>

      ) : sponsors.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px] shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No sponsors yet</h3>
          <p className="text-gray-500 max-w-md mb-8">
            Add sponsors to showcase your event partners. Assign tiers like Platinum, Gold, Silver, or Bronze.
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600"
          >
            <Plus className="w-5 h-5" /> Add Sponsor
          </Button>
        </div>

      ) : (
        <>
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Sponsors</h3>
              <p className="text-sm text-gray-500 mt-1">Manage event sponsors and their tiers.</p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600"
            >
              <Plus className="w-5 h-5" /> Add Sponsor
            </Button>
          </div>

          {/* Stats strip */}
          {/* <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Sponsors', value: sponsors.length,  color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100'   },
              { label: 'Platinum',       value: platinumCount,    color: 'text-slate-600',  bg: 'bg-slate-50 border-slate-200' },
              { label: 'Gold',           value: goldCount,        color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-100' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`p-4 rounded-2xl border ${bg} text-center`}>
                <p className={`text-2xl font-black tabular-nums ${color}`}>{value}</p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div> */}

          {/* List */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm min-h-[300px]">
            <SponsorList
              sponsors={sponsors}
              onDelete={handleDeleteRequest}
            />
          </div>
        </>
      )}

      {/* Add Modal */}
      <AddSponsorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId={eventId}
        onSuccess={fetchSponsors}
        showAlert={showAlert}
      />

      {/* Delete Confirmation Modal */}
      <DeleteSponsorModal
        isOpen={isDeleteOpen}
        onClose={handleDeleteClose}
        eventId={eventId}
        sponsor={deletingSponsor}
        onSuccess={fetchSponsors}
        showAlert={showAlert}
      />
    </div>
  );
}