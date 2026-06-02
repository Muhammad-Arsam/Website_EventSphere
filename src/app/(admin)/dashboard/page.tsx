import type { Metadata } from 'next';
import EventAnalyticsMetrics from '@/components/ecommerce/EventAnalyticsMetrics';

export const metadata: Metadata = {
  title: 'Eventsphere Dashboard',
  description: 'This is the home page for the Eventsphere Dashboard',
};

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 pb-20">
      <div className="col-span-12">
        <EventAnalyticsMetrics />
      </div>
    </div>
  );
}