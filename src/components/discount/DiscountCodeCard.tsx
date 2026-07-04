'use client';

import React, { useState } from 'react';
import {
  Tag, Calendar, Hash, Users, ToggleLeft, ToggleRight,
  Pencil, Trash2, Loader2,
} from 'lucide-react';
import { DiscountCode } from '@/types/discount.types';
import { discountService } from '@/api/discountService';

interface DiscountCodeCardProps {
  eventId: string;
  discount: DiscountCode;
  onEdit: (discount: DiscountCode) => void;
  onDelete: (discount: DiscountCode) => void;
  onRefresh: () => void;
  showAlert: (variant: 'success' | 'error', title: string, message: string) => void;
}

export default function DiscountCodeCard({
  eventId, discount, onEdit, onDelete, onRefresh, showAlert,
}: DiscountCodeCardProps) {
  const [isToggling, setIsToggling] = useState(false);

  const isActive = discount.status === 'ACTIVE';

  const validUntilFormatted = new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(discount.validUntil));

  const isExpired = new Date(discount.validUntil) < new Date();
  const usagePercent = discount.maxUses > 0
    ? Math.min(100, Math.round((discount.timesUsed / discount.maxUses) * 100))
    : 0;

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await discountService.toggleDiscountStatus(eventId, discount.id);
      showAlert('success', 'Status Updated', `Discount "${discount.code}" is now ${isActive ? 'inactive' : 'active'}.`);
      onRefresh();
    } catch (err: any) {
      showAlert('error', 'Toggle Failed', err.message || 'Failed to toggle discount status.');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">

      {/* Left Side: Icon & Info */}
      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">

        {/* Icon */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100 mt-1 sm:mt-0">
          <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold text-gray-900 text-sm sm:text-base tracking-wider font-mono truncate">
              {discount.code}
            </span>
            {/* Status badge */}
            <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${isExpired
                ? 'bg-gray-100 text-gray-400'
                : isActive
                  ? 'bg-green-50 text-green-700 border border-green-100'
                  : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
              {isExpired ? 'Expired' : isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-0">
            <span className="flex items-center gap-1 font-semibold text-violet-600">
              <Hash className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {discount.discountValue}% off
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {discount.timesUsed} / {discount.maxUses}
            </span>
            <span className={`flex items-center gap-1 ${isExpired ? 'text-red-400' : ''}`}>
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Until {validUntilFormatted}
            </span>
          </div>

          {/* Usage progress bar */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePercent >= 100 ? 'bg-red-400' : usagePercent >= 75 ? 'bg-amber-400' : 'bg-violet-500'
                  }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium shrink-0">{usagePercent}%</span>
          </div>
        </div>
      </div>

      {/* Actions (Always visible on mobile, hover-only on desktop) */}
      <div className="flex items-center justify-end gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity border-t sm:border-none pt-3 sm:pt-0 mt-1 sm:mt-0 border-gray-50">

        {/* Toggle */}
        <button
          onClick={handleToggle}
          disabled={isToggling || isExpired}
          title={isActive ? 'Deactivate' : 'Activate'}
          className={`p-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isActive
              ? 'text-green-600 hover:bg-green-50'
              : 'text-gray-400 hover:bg-gray-50'
            }`}
        >
          {isToggling
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : isActive
              ? <ToggleRight className="w-6 h-6 sm:w-5 sm:h-5" />
              : <ToggleLeft className="w-6 h-6 sm:w-5 sm:h-5" />
          }
        </button>

        {/* Edit */}
        <button
          onClick={() => onEdit(discount)}
          title="Edit"
          className="p-2 rounded-xl text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(discount)}
          title="Delete"
          className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}