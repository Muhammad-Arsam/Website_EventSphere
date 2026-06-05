'use client';

import React, { useEffect, useState } from 'react';
import { attendeeService } from '@/api/attendeeService';
import { AttendeeTicket } from '@/types/attendee.types';
import {
  Ticket,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Tag,
  QrCode,
  Phone,
  User,
  Hash,
  Clock,
  CalendarDays,
  IdCard,
} from 'lucide-react';
import Link from 'next/link';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<AttendeeTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const data = await attendeeService.getMyTickets();
        setTickets(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load your tickets.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-5">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Loading your tickets</h2>
        <p className="text-gray-500 text-sm">Please wait while we fetch your tickets.</p>
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

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
          <Ticket className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No tickets yet</h2>
        <p className="text-gray-500 max-w-md">
          You haven't purchased any tickets. Browse events and get your first ticket!
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
      {/* Hero Section – brand gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-700 via-brand-500 to-brand-900 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Ticket className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">My Tickets</h1>
          </div>
          <p className="text-white/80 max-w-2xl">
            Here are all the tickets that you've purchased from Eventsphere.
          </p>
          <div className="mt-4 text-sm text-white/60">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Modern Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <div
            key={ticket.ticketId}
            className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/3 overflow-hidden"
          >
            {/* Gradient top border */}
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-400 to-brand-600" />

            {/* Ticket header */}
            <div className="p-5 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                      {ticket.eventName}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Hash className="w-3 h-3" />
                      <span className="font-mono">{ticket.ticketReference.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    ticket.checkedIn
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}
                >
                  {ticket.checkedIn ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  {ticket.checkedIn ? 'Checked In' : 'Pending'}
                </div>
              </div>
            </div>

            {/* Ticket details */}
            <div className="p-5 space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-900">{formatDate(ticket.eventDate)}</p>
                  <p className="text-xs text-gray-500">Event Date</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-900 line-clamp-1">{ticket.venue}</p>
                  <p className="text-xs text-gray-500">Venue</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Tag className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-900 font-medium">{ticket.tierName}</p>
                  <p className="text-xs text-gray-500">Ticket Type</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <User className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-900">{ticket.assignedName}</p>
                  <p className="text-xs text-gray-500">Attendee</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Phone className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-900">{ticket.assignedPhone || 'Not provided'}</p>
                  <p className="text-xs text-gray-500">Phone</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <IdCard className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-900">{ticket.assignedCnic || 'Not provided'}</p>
                  <p className="text-xs text-gray-500">CNIC</p>
                </div>
              </div>
            </div>

            {/* QR Code Hash */}
            <div className="p-5 pt-0">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <QrCode className="w-3 h-3" />
                  <span>QR Code Hash</span>
                </div>
                <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                  {ticket.qrCodeHash}
                </code>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}