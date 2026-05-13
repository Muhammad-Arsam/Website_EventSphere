import React from 'react';
import CreateEventForm from '@/components/events/CreateEventForm';

export default function CreateEventPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create New Event
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Draft your event details to get started.
        </p>
      </div>
      
      {/* Render the form component we built earlier */}
      <CreateEventForm />
    </div>
  );
}