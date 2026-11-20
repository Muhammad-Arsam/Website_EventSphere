'use client';

import { ArrowDownLeft, ArrowUpRight, Hourglass, Wallet } from 'lucide-react';
import type { OrganizationWallet } from '@/types/organization.types';
import { getTransactionTotals, pluralize } from '../workspaceHelpers';
import { KpiCard } from '../workspaceShared';

interface Props {
  wallet: OrganizationWallet | null; // null while it loads, or when it failed
  loading: boolean;
  pendingBalance: number;
}

const UNAVAILABLE = () => '—';

// Four colored cards, same style as the dashboard KPI cards.
// While the wallet loads they show a spinner; if it failed they show a dash instead of a number.
export default function WalletKpis({ wallet, loading, pendingBalance }: Props) {
  const failed = !loading && !wallet;
  const totals = getTransactionTotals(wallet?.recentTransactions ?? []);
  const walletValue = (value: number): number | null => (loading ? null : failed ? 0 : value);
  const walletFormat = failed ? UNAVAILABLE : undefined;
  const walletPrefix = failed ? undefined : 'Rs.';
  // One caption helper: "Loading…" while waiting, a short error text if the wallet failed
  const caption = (ready: string) => (loading ? 'Loading…' : failed ? 'Could not load wallet' : ready);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        index={0}
        label="Available Balance"
        caption={caption('Ready to use')}
        icon={Wallet}
        value={walletValue(wallet?.availableBalance ?? 0)}
        format={walletFormat}
        prefix={walletPrefix}
      />
      <KpiCard
        index={1}
        label="Pending Balance"
        caption="Awaiting release"
        icon={Hourglass}
        value={Number(pendingBalance) || 0}
        prefix="Rs."
      />
      <KpiCard
        index={2}
        label="Money In"
        caption={caption(`${pluralize(totals.creditCount, 'credit')} in recent records`)}
        icon={ArrowDownLeft}
        value={walletValue(totals.credits)}
        format={walletFormat}
        prefix={walletPrefix}
      />
      <KpiCard
        index={3}
        label="Money Out"
        caption={caption(`${pluralize(totals.debitCount, 'debit')} in recent records`)}
        icon={ArrowUpRight}
        value={walletValue(totals.debits)}
        format={walletFormat}
        prefix={walletPrefix}
      />
    </div>
  );
}
