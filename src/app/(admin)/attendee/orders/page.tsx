'use client';

import React, { useEffect, useState } from 'react';
import { attendeeService } from '@/api/attendeeService';
import { AttendeeOrder } from '@/types/attendee.types';
import {
  ShoppingBag,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  CreditCard,
  Hash,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<AttendeeOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const data = await attendeeService.getMyOrders();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load your orders.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getPaymentStatusBadge = (status: string) => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus === 'success' || lowerStatus === 'completed' || lowerStatus === 'paid') {
      return {
        icon: <CheckCircle className="w-3 h-3" />,
        text: 'Paid',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      };
    }
    if (lowerStatus === 'pending') {
      return {
        icon: <Clock className="w-3 h-3" />,
        text: 'Pending',
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      };
    }
    return {
      icon: <XCircle className="w-3 h-3" />,
      text: 'Failed',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-5">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Loading your orders</h2>
        <p className="text-gray-500 text-sm">Please wait while we fetch your orders.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-500 max-w-md">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
        <p className="text-gray-500 max-w-md">
          You haven't placed any orders. Browse events and book your first ticket!
        </p>
        <Link
          href="/attendee/explore"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors"
        >
          Browse Events
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-700 via-brand-500 to-brand-900 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">My Orders</h1>
          </div>
          <p className="text-white/80 max-w-2xl">
            Here are all the orders you've placed on Eventsphere.
          </p>
          <div className="mt-4 text-sm text-white/60">
            {orders.length} order{orders.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => {
          const statusBadge = getPaymentStatusBadge(order.paymentStatus);
          return (
            <div
              key={order.orderId}
              className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/3 overflow-hidden"
            >
              {/* Gradient top border */}
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-400 to-brand-600" />

              {/* Header */}
              <div className="p-5 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                        {order.eventName}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Hash className="w-3 h-3" />
                        <span className="font-mono">{order.orderReference.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge.className}`}
                  >
                    {statusBadge.icon}
                    {statusBadge.text}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900 font-semibold">
                      Rs. {order.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Total Amount</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900">{formatDate(order.createdAt)}</p>
                    <p className="text-xs text-gray-500">Order Date</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}