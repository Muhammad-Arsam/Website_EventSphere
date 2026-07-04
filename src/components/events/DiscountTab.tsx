'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Tag, Plus, Loader2 } from 'lucide-react';
import { discountService } from '@/api/discountService';
import { DiscountCode } from '@/types/discount.types';
import DiscountCodeList from '@/components/discount/DiscountCodeList';
import DiscountCodeModal from '@/components/discount/DiscountCodeModal';
import DeleteDiscountModal from '@/components/discount/DeleteDiscountModal';
import Alert from '@/components/ui/alert/Alert';
import Button from '@/components/ui/button/Button';

interface DiscountTabProps {
  eventId: string;
}

export default function DiscountTab({ eventId }: DiscountTabProps) {
  const [discounts, setDiscounts]               = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading]               = useState(false);
  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [editingDiscount, setEditingDiscount]   = useState<DiscountCode | null>(null);
  const [deletingDiscount, setDeletingDiscount] = useState<DiscountCode | null>(null);
  const [isDeleteOpen, setIsDeleteOpen]         = useState(false);
  const [alert, setAlert]                       = useState<{
    variant: 'success' | 'error'; title: string; message: string;
  } | null>(null);

  const showAlert = useCallback((variant: 'success' | 'error', title: string, message: string) => {
    setAlert({ variant, title, message });
    // Auto-clear after Alert's 3s timer
    setTimeout(() => setAlert(null), 3500);
  }, []);

  const fetchDiscounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await discountService.getDiscounts(eventId);
      setDiscounts(data);
    } catch (err: any) {
      showAlert('error', 'Load Failed', err.message || 'Failed to load discount codes.');
    } finally {
      setIsLoading(false);
    }
  }, [eventId, showAlert]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const handleEdit = (discount: DiscountCode) => {
    setEditingDiscount(discount);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (discount: DiscountCode) => {
    setDeletingDiscount(discount);
    setIsDeleteOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingDiscount(null);
  };

  const handleDeleteClose = () => {
    setIsDeleteOpen(false);
    setDeletingDiscount(null);
  };

  // Summary stats
  const activeCount  = discounts.filter(d => d.status === 'ACTIVE').length;
  const expiredCount = discounts.filter(d => new Date(d.validUntil) < new Date()).length;
  const totalUsed    = discounts.reduce((sum, d) => sum + d.timesUsed, 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4 sm:space-y-6">

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

      ) : discounts.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-6 sm:p-12 text-center flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] shadow-sm">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-violet-50 text-violet-500 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <Tag className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No discount codes yet</h3>
          <p className="text-sm sm:text-base text-gray-500 max-w-md mb-6 sm:mb-8">
            Create promo codes to offer discounts to your attendees. Set expiry dates and usage limits.
          </p>
          <Button
            onClick={() => {
              setEditingDiscount(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600"
          >
            <Plus className="w-5 h-5" /> Add Discount Code
          </Button>
        </div>

      ) : (
        <>
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Discount Codes</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage promo codes and their limits.</p>
            </div>
            <Button
              onClick={() => {
                setEditingDiscount(null);
                setIsModalOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600"
            >
              <Plus className="w-5 h-5" /> Add Discount Code
            </Button>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { label: 'Total Codes', value: discounts.length, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
              { label: 'Active',      value: activeCount,      color: 'text-green-600',  bg: 'bg-green-50 border-green-100' },
              { label: 'Total Used',  value: totalUsed,        color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border ${bg} text-center flex flex-col justify-center`}>
                <p className={`text-xl sm:text-2xl font-black tabular-nums truncate ${color}`}>{value}</p>
                <p className="text-[10px] sm:text-xs font-semibold text-gray-500 mt-0.5 sm:mt-1 truncate">{label}</p>
              </div>
            ))}
          </div>

          {/* List */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm min-h-[300px]">
            <DiscountCodeList
              eventId={eventId}
              discounts={discounts}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              onRefresh={fetchDiscounts}
              showAlert={showAlert}
            />
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      <DiscountCodeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        eventId={eventId}
        existingDiscount={editingDiscount}
        onSuccess={fetchDiscounts}
        showAlert={showAlert}
      />

      {/* Delete Confirmation Modal */}
      <DeleteDiscountModal
        isOpen={isDeleteOpen}
        onClose={handleDeleteClose}
        eventId={eventId}
        discount={deletingDiscount}
        onSuccess={fetchDiscounts}
        showAlert={showAlert}
      />
    </div>
  );
}