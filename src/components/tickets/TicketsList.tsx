'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, ChevronDown, Loader2, Ticket, Mail, Tag, Phone, CheckCircle, Clock, CreditCard, IdCard } from 'lucide-react';
import { eventService } from '@/api/eventService';
import { EventResponse, AttendeeTicket } from '@/types/event.types';

export default function TicketsList() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [tickets, setTickets] = useState<AttendeeTicket[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [isTicketsLoading, setIsTicketsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch only published events
  useEffect(() => {
    const orgId = localStorage.getItem('orgId');
    if (!orgId) {
      setError('Organization not found. Please log in again.');
      setIsEventsLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        setIsEventsLoading(true);
        const data = await eventService.getOrgEvents(orgId);
        const published = data.filter(e => e.status === 'PUBLISHED');
        setEvents(published);
        if (published.length > 0) {
          setSelectedEventId(published[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load events.');
      } finally {
        setIsEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Fetch tickets when selected event changes
  useEffect(() => {
    if (!selectedEventId) return;

    const fetchTickets = async () => {
      try {
        setIsTicketsLoading(true);
        setTickets([]);
        const data = await eventService.getAllTickets(selectedEventId);
        setTickets(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load tickets.');
      } finally {
        setIsTicketsLoading(false);
      }
    };

    fetchTickets();
  }, [selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  if (isEventsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-11 w-72 rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white dark:border-gray-800 h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-500/10 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center dark:border-gray-800">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
          <CalendarDays className="w-7 h-7 text-brand-500" />
        </div>
        <p className="font-semibold text-gray-900 dark:text-white mb-1">No Published Events</p>
        <p className="text-sm text-gray-400">Publish an event to see tickets sold.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero + Dropdown */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-700 via-brand-500 to-brand-900 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-white/70">All Sold Tickets</p>
            <h2 className="mt-2 text-3xl font-bold lg:text-4xl">{selectedEvent?.title}</h2>
            <p className="mt-3 max-w-2xl text-white/80">View every ticket issued, check-in status, and attendee details.</p>
          </div>
          <div className="relative w-full lg:w-auto lg:min-w-[320px]">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/20 bg-white/10 px-5 py-3 pr-12 text-sm font-semibold text-white backdrop-blur-xl outline-none transition-all hover:bg-white/15"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id} className="text-black">
                  {event.title}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      {isTicketsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800">
          <Ticket className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">No tickets sold yet for this event.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => {
            const isCheckedIn = ticket.ticketStatus === 'checked_in';
            const eventDate = new Date(ticket.eventDate);
            const formattedDate = eventDate.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={ticket.ticketId}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-white/3"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-400 to-brand-600" />
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-5 w-5 text-brand-500" />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        #{ticket.ticketReference.slice(0, 8)}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isCheckedIn
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}
                    >
                      {isCheckedIn ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                      {isCheckedIn ? 'Checked In' : 'Pending'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{ticket.assignedName}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{ticket.assignedEmail || 'Not provided'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{ticket.assignedPhone || 'Not provided'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <IdCard className="h-3.5 w-3.5" />
                      <span>{ticket.assignedCnic || 'Not provided'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Tag className="h-3.5 w-3.5" />
                      <span>{ticket.tierName}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        <span>Order: {ticket.orderReference.slice(0, 8)}</span>
                      </div>
                      <span>{formattedDate}</span>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Event: {ticket.eventName}</span>
                    </div>
                    
                    {isCheckedIn && ticket.checkedInTime && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        Checked in at {new Date(ticket.checkedInTime).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}