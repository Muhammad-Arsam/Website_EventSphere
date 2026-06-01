'use client';

import React from 'react';
import { DiscountCode } from '@/types/discount.types';
import DiscountCodeCard from './DiscountCodeCard';

interface DiscountCodeListProps {
  eventId: string;
  discounts: DiscountCode[];
  onEdit: (discount: DiscountCode) => void;
  onDelete: (discount: DiscountCode) => void;
  onRefresh: () => void;
  showAlert: (variant: 'success' | 'error', title: string, message: string) => void;
}

export default function DiscountCodeList({
  eventId, discounts, onEdit, onDelete, onRefresh, showAlert,
}: DiscountCodeListProps) {
  return (
    <div className="space-y-3">
      {discounts.map((discount) => (
        <DiscountCodeCard
          key={discount.id}
          eventId={eventId}
          discount={discount}
          onEdit={onEdit}
          onDelete={onDelete}
          onRefresh={onRefresh}
          showAlert={showAlert}
        />
      ))}
    </div>
  );
}