'use client';

import React, { useEffect, useState } from 'react';
import { attendeeService } from '@/api/attendeeService';
import { AttendeeTicket, TransferTicketRequest } from '@/types/attendee.types';
import {
  Ticket,
  Loader2,
  AlertTriangle,
  CheckCircle,
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
  Send,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Alert from '@/components/ui/alert/Alert';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<AttendeeTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    variant: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    key: number;
  } | null>(null);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<AttendeeTicket | null>(null);
  const [transferData, setTransferData] = useState<TransferTicketRequest>({
    newName: '',
    newEmail: '',
    newCnic: '',
    newPhone: '',
  });
  const [isTransferring, setIsTransferring] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<TransferTicketRequest | null>(null);

  // Validation errors
  const [phoneError, setPhoneError] = useState('');
  const [cnicError, setCnicError] = useState('');

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

  useEffect(() => {
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

  const openTransferModal = (ticket: AttendeeTicket) => {
    setSelectedTicket(ticket);
    setTransferData({
      newName: ticket.assignedName || '',
      newEmail: '',
      newCnic: ticket.assignedCnic || '',
      newPhone: ticket.assignedPhone || '',
    });
    setPhoneError('');
    setCnicError('');
    setShowTransferModal(true);
  };

  // Validate phone and CNIC on change
  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length !== 0 && digitsOnly.length !== 11) {
      setPhoneError('Phone number must be exactly 11 digits');
    } else {
      setPhoneError('');
    }
    setTransferData({ ...transferData, newPhone: digitsOnly });
  };

  const handleCnicChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length !== 0 && digitsOnly.length !== 13) {
      setCnicError('CNIC must be exactly 13 digits');
    } else {
      setCnicError('');
    }
    setTransferData({ ...transferData, newCnic: digitsOnly });
  };

  const isFormValid = () => {
    return (
      transferData.newName.trim() !== '' &&
      transferData.newEmail.trim() !== '' &&
      transferData.newCnic.length === 13 &&
      transferData.newPhone.length === 11 &&
      !phoneError &&
      !cnicError
    );
  };

  const handleTransferClick = () => {
    if (!selectedTicket) return;
    if (!isFormValid()) {
      setAlert({
        variant: 'error',
        title: 'Invalid Fields',
        message: 'Please check your inputs: name, email, valid 11‑digit phone and 13‑digit CNIC are required.',
        key: Date.now(),
      });
      return;
    }
    setPendingTransfer(transferData);
    setShowConfirmModal(true);
  };

  const confirmTransfer = async () => {
    if (!selectedTicket || !pendingTransfer) return;
    setIsTransferring(true);
    try {
      await attendeeService.transferTicket(selectedTicket.ticketId, pendingTransfer);
      setAlert({
        variant: 'success',
        title: 'Ticket Transferred',
        message: `Ticket successfully transferred to ${pendingTransfer.newEmail}.`,
        key: Date.now(),
      });
      setShowTransferModal(false);
      setShowConfirmModal(false);
      fetchTickets();
    } catch (err: any) {
      setAlert({
        variant: 'error',
        title: 'Transfer Failed',
        message: err.message || 'Failed to transfer ticket.',
        key: Date.now(),
      });
    } finally {
      setIsTransferring(false);
      setPendingTransfer(null);
    }
  };

  const cancelTransferFlow = () => {
    setShowTransferModal(false);
    setShowConfirmModal(false);
    setPendingTransfer(null);
    setPhoneError('');
    setCnicError('');
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
      {alert && (
        <div className="fixed top-6 right-6 z-999999 w-full max-w-sm drop-shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <Alert
            key={alert.key}
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
          />
        </div>
      )}

      {/* Hero Section */}
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

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <div
            key={ticket.ticketId}
            className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/3 overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-400 to-brand-600" />
            <div className="p-5 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{ticket.eventName}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Hash className="w-3 h-3" />
                      <span className="font-mono">{ticket.ticketReference.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ticket.checkedIn
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}
                >
                  {ticket.checkedIn ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {ticket.checkedIn ? 'Checked In' : 'Pending'}
                </div>
              </div>
            </div>
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
            <div className="p-5 pt-0 space-y-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <QrCode className="w-3 h-3" />
                  <span>QR Code Hash</span>
                </div>
                <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                  {ticket.qrCodeHash}
                </code>
              </div>
              {!ticket.checkedIn && (
                <button
                  onClick={() => openTransferModal(ticket)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-50 text-brand-700 text-sm font-medium hover:bg-brand-100 transition-colors border border-brand-200"
                >
                  <Send className="w-4 h-4" />
                  Transfer Ticket
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Transfer Modal (Edit Form) with validation */}
      {showTransferModal && selectedTicket && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTicket.eventName}</p>
              <p className="text-sm text-gray-500">{selectedTicket.tierName}</p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={transferData.newName}
                onChange={(e) => setTransferData({ ...transferData, newName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="email"
                placeholder="Email *"
                value={transferData.newEmail}
                onChange={(e) => setTransferData({ ...transferData, newEmail: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div>
                <input
                  type="text"
                  placeholder="CNIC * (13 digits)"
                  value={transferData.newCnic}
                  onChange={(e) => handleCnicChange(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${cnicError ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500`}
                />
                {cnicError && <p className="text-xs text-red-500 mt-1">{cnicError}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number * (11 digits)"
                  value={transferData.newPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${phoneError ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500`}
                />
                {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => cancelTransferFlow()}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferClick}
                disabled={!isFormValid()}
                className="flex-1 px-4 py-2 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (unchanged) */}
      {showConfirmModal && selectedTicket && pendingTransfer && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirm Transfer</h3>
            <p className="text-sm text-gray-500 mb-4">
              You are about to transfer your ticket for <strong>{selectedTicket.eventName}</strong> ({selectedTicket.tierName}) to:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-1 text-sm mb-4">
              <p><strong>Name:</strong> {pendingTransfer.newName}</p>
              <p><strong>Email:</strong> {pendingTransfer.newEmail}</p>
              <p><strong>CNIC:</strong> {pendingTransfer.newCnic}</p>
              <p><strong>Phone:</strong> {pendingTransfer.newPhone}</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg text-center mb-4">
              <AlertTriangle className="w-4 h-4" />
              <span>This action is irreversible. You will no longer be able to use this ticket.</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => cancelTransferFlow()}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Go Back
              </button>
              <button
                onClick={confirmTransfer}
                disabled={isTransferring}
                className="flex-1 px-4 py-2 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isTransferring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isTransferring ? 'Transferring...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}