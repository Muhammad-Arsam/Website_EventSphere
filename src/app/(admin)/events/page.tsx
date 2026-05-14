'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import EventCard from '@/components/events/EventCard';
import { eventService } from '@/api/eventService'; 
import { organizationService } from '@/api/organizationService'; 
import { EventResponse } from '@/types/event.types';
import { Plus, CalendarDays, AlertCircle } from 'lucide-react';
import { getOrgId, setOrgId } from '@/utils/token'; 

export default function EventsOversightPage() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventsFlow = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Check Local Storage First (Super Fast)
        let currentOrgId = getOrgId();

        // 2. Fallback: If not in local storage, fetch from API and save it
        if (!currentOrgId) {
          const org = await organizationService.getMyOrganization();
          if (!org) {
            setError("We couldn't find an organization linked to your account. Please create one first.");
            setIsLoading(false);
            return;
          }
          currentOrgId = org.id;
          setOrgId(org.id); // Save for next time
        }

        setOrganizationId(currentOrgId);

        // 3. Fetch Events directly
        const eventData = await eventService.getOrgEvents(currentOrgId);
        setEvents(eventData);

      } catch (err: any) {
        console.error('Failed to fetch events:', err);
        setError(err.message || 'Failed to load events. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventsFlow();
  }, []);

  // --- SORTING LOGIC ADDED HERE ---
  // Create a sorted copy of the events array in ascending order (closest dates first)
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events Oversight</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your events, drafts, and ticketing.</p>
        </div>
        
        {/* Only show the Create button if they actually have an organization */}
        {organizationId && (
          <Link 
            href="/events/create"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Create New Event
          </Link>
        )}
      </div>

      {/* States: Loading, Error, Empty, or Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <CalendarDays className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No events found</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">You haven't created any events yet. Start by creating a new event draft.</p>
          <Link href="/events/create" className="text-emerald-600 font-medium text-sm hover:underline">
            + Create your first event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* --- MAP OVER sortedEvents INSTEAD OF events --- */}
          {sortedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}