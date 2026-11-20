'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { WalletTransaction } from '@/types/organization.types';
import PageSizeSelect from '@/components/common/pagination/PageSizeSelect';
import PaginationBar from '@/components/common/pagination/PaginationBar';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/components/common/pagination/paginationHelpers';
import { usePagination } from '@/hooks/usePagination';
import { sortTransactions } from '../workspaceHelpers';
import { PanelHeader, PanelShell, PanelState } from '../workspaceShared';
import TransactionRow from './TransactionRow';
import TransactionsSkeleton from './TransactionsSkeleton';

interface Props {
  transactions: WalletTransaction[] | null;
  loading: boolean;
  error: string | null;
}

const TONE = 'forest' as const;

// The wallet's recent transactions, split into pages. The user picks how many rows each page has.
export default function TransactionsCard({ transactions, loading, error }: Props) {
  const sorted = useMemo(() => sortTransactions(transactions ?? []), [transactions]);
  const pagination = usePagination(sorted, DEFAULT_PAGE_SIZE);

  return (
    <PanelShell tone={TONE} className="h-full">
      <PanelHeader
        tone={TONE}
        title="Recent transactions"
        subtitle="Money in and out of your organization wallet"
        right={
          sorted.length > 0 && (
            <PageSizeSelect
              tone={TONE}
              id="transactions-page-size"
              value={pagination.pageSize}
              options={PAGE_SIZE_OPTIONS}
              onChange={pagination.setPageSize}
            />
          )
        }
      />

      {loading ? (
        <TransactionsSkeleton rows={6} />
      ) : (
        <PanelState
          tone={TONE}
          loading={false}
          error={error}
          isEmpty={sorted.length === 0}
          emptyTitle="No transactions yet"
          emptyText="Transactions will appear here once activity begins."
        >
          {/* key = page + page size: the rows animate in again on every page change */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={`${pagination.pageSize}-${pagination.page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="divide-y divide-white/10"
            >
              {pagination.pageItems.map((txn, i) => (
                <TransactionRow key={txn.transactionId ?? `${pagination.page}-${i}`} transaction={txn} index={i} />
              ))}
            </motion.ul>
          </AnimatePresence>

          <PaginationBar
            tone={TONE}
            page={pagination.page}
            totalPages={pagination.totalPages}
            from={pagination.from}
            to={pagination.to}
            totalItems={pagination.totalItems}
            onPageChange={pagination.setPage}
            itemLabel="transactions"
          />
        </PanelState>
      )}
    </PanelShell>
  );
}
