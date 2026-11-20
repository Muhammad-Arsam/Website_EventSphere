'use client';

// The page frame: it loads the data (useWorkspace) and connects the parts.
// Same idea as EventAnalyticsMetrics and DemandForecastDashboard: this file only wires things together.

import { useModal } from '@/hooks/useModal';
import EditWorkspaceModal from './EditWorkspaceModal';
import { Reveal, StatusMessage } from './workspaceShared';
import OrganizationDetails from './parts/OrganizationDetails';
import OrganizationHero from './parts/OrganizationHero';
import TransactionsCard from './parts/TransactionsCard';
import { useWorkspace } from './parts/useWorkspace';
import WalletKpis from './parts/WalletKpis';
import WorkspaceSkeleton from './parts/WorkspaceSkeleton';

export default function WorkspaceDashboard() {
  const { organization, wallet, refreshing, reload } = useWorkspace();
  const { isOpen, openModal, closeModal } = useModal();

  if (organization.loading) return <WorkspaceSkeleton />;

  if (organization.error || !organization.data) {
    return (
      <StatusMessage
        variant="error"
        title="Could not load your organization"
        text={organization.error ?? 'Something went wrong. Please try again.'}
        onRetry={reload}
      />
    );
  }

  const org = organization.data;

  return (
    <div className="space-y-6 pb-20">
      <OrganizationHero organization={org} refreshing={refreshing} onEdit={openModal} onReload={reload} />

      <WalletKpis wallet={wallet.data} loading={wallet.loading} pendingBalance={org.pendingBalance} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* On big screens the details card stays in view while the long transactions list scrolls */}
        <Reveal className="xl:sticky xl:top-24 xl:col-span-1 xl:self-start">
          <OrganizationDetails organization={org} />
        </Reveal>
        <Reveal delay={0.08} className="xl:col-span-2 [&>section]:h-full">
          <TransactionsCard
            transactions={wallet.data?.recentTransactions ?? null}
            loading={wallet.loading}
            error={wallet.error}
          />
        </Reveal>
      </div>

      {/* The edit form is unchanged */}
      <EditWorkspaceModal isOpen={isOpen} closeModal={closeModal} organization={org} />
    </div>
  );
}
