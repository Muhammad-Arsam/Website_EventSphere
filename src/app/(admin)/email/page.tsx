import type { Metadata } from 'next';
import EmailBroadcast from '@/components/email/EmailBroadcast';

export const metadata: Metadata = {
  title: 'Email Broadcast | EventSphere',
  description: 'Send custom or broadcast emails to your event attendees.',
};

export default function EmailSettingsPage() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 pb-20">
      <div className="col-span-12">
        <EmailBroadcast />
      </div>
    </div>
  );
}