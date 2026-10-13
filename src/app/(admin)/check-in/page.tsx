import type { Metadata } from 'next';
import CheckInScanner from '@/components/checkin/CheckInScanner';

export const metadata: Metadata = {
  title: 'Ticket Check-In | EventSphere',
  description: 'Scan attendee QR codes to check them in at your event.',
};

export default function CheckInPage() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 pb-20">
      <div className="col-span-12">
        <CheckInScanner />
      </div>
    </div>
  );
}