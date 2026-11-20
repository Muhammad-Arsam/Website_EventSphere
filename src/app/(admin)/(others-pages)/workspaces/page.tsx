import type { Metadata } from 'next';
import WorkspaceDashboard from '@/components/workspaces/WorkspaceDashboard';

export const metadata: Metadata = {
  title: 'Eventsphere Organization',
  description: 'Manage your organization, wallet balance and transactions',
};

export default function WorkspacesPage() {
  return <WorkspaceDashboard />;
}
