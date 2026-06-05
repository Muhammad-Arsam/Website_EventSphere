import type { Metadata } from 'next';
import TicketsList from '@/components/tickets/TicketsList';

export const metadata: Metadata = {
  title: 'Event Tickets | EventSphere',
  description: 'Manage and view all tickets sold for your events.',
};

export default function TicketsPage() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 pb-20">
      <div className="col-span-12">
        <TicketsList />
      </div>
    </div>
  );
}