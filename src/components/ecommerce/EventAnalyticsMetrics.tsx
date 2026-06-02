'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign, Ticket, Users, CheckCircle, Clock, ChevronDown, Loader2, CalendarDays,
} from 'lucide-react';
import { eventService } from '@/api/eventService';
import { analyticsService } from '@/api/analyticsService';
import { EventResponse } from '@/types/event.types';
import { EventAnalytics } from '@/types/analytics.types';

export default function EventAnalyticsMetrics() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch org events on mount
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
        // Only show published events
        const published = data.filter(e => e.status === 'PUBLISHED');
        setEvents(published);
        // Auto-select first event
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

  // Fetch analytics whenever selected event changes
  useEffect(() => {
    if (!selectedEventId) return;

    const fetchAnalytics = async () => {
      try {
        setIsAnalyticsLoading(true);
        setAnalytics(null);
        const data = await analyticsService.getEventAnalytics(selectedEventId);
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics.');
      } finally {
        setIsAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // ── Loading skeleton ──
  if (isEventsLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-11 w-72 rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 md:gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-white/2 h-[130px]" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-500/10 dark:text-red-400">
        {error}
      </div>
    );
  }

  // ── No published events ──
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-white/2">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
          <CalendarDays className="w-7 h-7 text-brand-500" />
        </div>
        <p className="font-semibold text-gray-900 dark:text-white mb-1">No Published Events</p>
        <p className="text-sm text-gray-400">Publish an event to start seeing analytics here.</p>
      </div>
    );
  }

  const occupancyRate = analytics?.totalCapacity
    ? Math.round((analytics.totalTicketsSold / analytics.totalCapacity) * 100)
    : 0;

  const checkInRate = analytics?.totalTicketsSold
    ? Math.round((analytics.totalCheckedIn / analytics.totalTicketsSold) * 100)
    : 0;

  const revenuePerTicket =
    analytics?.totalTicketsSold && analytics.totalTicketsSold > 0
      ? Math.round(analytics.totalRevenue / analytics.totalTicketsSold)
      : 0;

  const statCards = [
    {
      title: 'Total Revenue',
      value: analytics ? `Rs.${analytics.totalRevenue.toLocaleString()}` : '—',
      desc: 'From ticket sales',
      icon: DollarSign,
      colorClass: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400',
    },
    {
      title: 'Tickets Sold',
      value: analytics ? analytics.totalTicketsSold.toLocaleString() : '—',
      desc: 'Confirmed purchases',
      icon: Ticket,
      colorClass: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400',
    },
    {
      title: 'Total Capacity',
      value: analytics ? analytics.totalCapacity.toLocaleString() : '—',
      desc: 'Max attendees',
      icon: Users,
      colorClass: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400',
    },
    {
      title: 'Checked In',
      value: analytics ? analytics.totalCheckedIn.toLocaleString() : '—',
      desc: 'Arrived at venue',
      icon: CheckCircle,
      colorClass: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400',
    },
    {
      title: 'Pending Entry',
      value: analytics ? analytics.totalPendingEntry.toLocaleString() : '—',
      desc: 'Yet to check in',
      icon: Clock,
      colorClass: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400',
    },
  ];

  return (
    <div className="space-y-8">

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-700 via-brand-500 to-brand-900 p-8 text-white shadow-xl">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <p className="text-sm font-medium text-white/70">
              Event Performance Dashboard
            </p>

            <h2 className="mt-2 text-3xl font-bold lg:text-4xl">
              {selectedEvent?.title}
            </h2>

            <p className="mt-3 max-w-2xl text-white/80">
              Monitor ticket sales, revenue, attendance, and check-ins
              in real time.
            </p>
          </div>

          <div className="relative w-full lg:w-auto lg:min-w-[320px]">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/20 bg-white/10 px-5 py-3 pr-12 text-sm font-semibold text-white backdrop-blur-xl outline-none transition-all hover:bg-white/15"
            >
              {events.map((event) => (
                <option
                  key={event.id}
                  value={event.id}
                  className="text-black"
                >
                  {event.title}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">

        {statCards.map((card, index) => {

          const Icon = card.icon;

          return (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-linear-to-b from-white to-gray-50/70 p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-gray-800 dark:bg-white/3 dark:backdrop-blur-xl"
            >

              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-400 to-brand-600" />

              <Icon
                className="absolute -right-6 -bottom-6 h-28 w-28 text-gray-100 transition-all duration-500 group-hover:scale-110 dark:text-white/3"
                strokeWidth={1.2}
              />

              <div className="relative z-10">

                <div className="flex items-center justify-between">

                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    {card.title}
                  </span>

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${card.colorClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                </div>

                {isAnalyticsLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-400">
                      Loading...
                    </span>
                  </div>
                ) : (
                  <>
                    <h3 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {card.value}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {card.desc}
                    </p>

                    {/* <div className="mt-5 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600 dark:bg-green-500/10 dark:text-green-400">
                      Live Data
                    </div> */}
                  </>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* KPI Summary */}
      <div className="grid gap-4 md:grid-cols-3">

        <div className="rounded-3xl border border-brand-100 bg-brand-50 p-6 dark:border-brand-500/20 dark:bg-brand-500/10">
          <p className="text-sm font-medium text-brand-600">
            Occupancy Rate
          </p>

          <h3 className="mt-2 text-4xl font-bold text-brand-700 dark:text-brand-300">
            {occupancyRate}%
          </h3>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <p className="text-sm font-medium text-emerald-600">
            Revenue Per Ticket
          </p>

          <h3 className="mt-2 text-4xl font-bold text-emerald-700 dark:text-emerald-300">
            Rs.{revenuePerTicket.toLocaleString()}
          </h3>
        </div>

        <div className="rounded-3xl border border-violet-100 bg-violet-50 p-6 dark:border-violet-500/20 dark:bg-violet-500/10">
          <p className="text-sm font-medium text-violet-600">
            Check-In Rate
          </p>

          <h3 className="mt-2 text-4xl font-bold text-violet-700 dark:text-violet-300">
            {checkInRate}%
          </h3>
        </div>

      </div>

      {/* Occupancy Progress */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/3 dark:backdrop-blur-xl">

        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            Venue Occupancy
          </span>

          <span className="font-bold text-brand-600">
            {occupancyRate}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-linear-to-r from-brand-400 to-brand-600 transition-all duration-700"
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
      </div>

    </div>
  );
}