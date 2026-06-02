'use client';

import React, { useEffect, useState } from 'react';
import {
  Wallet, ArrowDownLeft, ArrowUpRight, Clock, TrendingUp, Loader2, RefreshCw,
} from 'lucide-react';
import { organizationService } from '@/api/organizationService';
import { OrganizationWallet, WalletTransaction } from '@/types/organization.types';

interface WalletCardProps {
  organizationId: string;
}

const TXN_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  CREDIT: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: <ArrowDownLeft className="w-4 h-4" />,
  },
  DEBIT: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-500 dark:text-red-400',
    icon: <ArrowUpRight className="w-4 h-4" />,
  },
};

const DEFAULT_TXN_STYLE = {
  bg: 'bg-gray-50 dark:bg-gray-800',
  text: 'text-gray-500 dark:text-gray-400',
  icon: <TrendingUp className="w-4 h-4" />,
};

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(dateStr));
}

export default function WalletCard({ organizationId }: WalletCardProps) {
  const [wallet, setWallet]     = useState<OrganizationWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const fetchWallet = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const data = await organizationService.getWallet(organizationId);
      setWallet(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load wallet.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (organizationId) fetchWallet();
  }, [organizationId]);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-white/2 p-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-7 h-7 animate-spin text-brand-500" />
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-500/10 p-6 text-sm text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!wallet) return null;

  const txnStyle = (type: string) => TXN_COLORS[type.toUpperCase()] ?? DEFAULT_TXN_STYLE;

  return (
    <div className="space-y-4">

      {/* ── Balance card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-600 to-brand-400 p-8 text-white shadow-lg shadow-brand-500/20">
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-16 -left-8 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-white/80 uppercase tracking-widest">
                Available Balance
              </span>
            </div>
            <p className="text-5xl font-black tracking-tight mb-1">
              Rs.{wallet.availableBalance.toLocaleString()}
            </p>
            <p className="text-sm text-white/60 font-medium">Organization Wallet</p>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => fetchWallet(true)}
            disabled={isRefreshing}
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Transactions ── */}
      <div className="rounded-3xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-white/2 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Recent Transactions</h3>
          </div>
          <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-full">
            {wallet.recentTransactions.length} records
          </span>
        </div>

        {/* List */}
        {wallet.recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Wallet className="w-7 h-7 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="font-semibold text-gray-500 dark:text-gray-400 text-sm">No transactions yet</p>
            <p className="text-xs text-gray-400 mt-1">Transactions will appear here once activity begins.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {wallet.recentTransactions.map((txn, idx) => {
              const style = txnStyle(txn.transactionType);
              const isCredit = txn.transactionType.toUpperCase() === 'CREDIT';
              return (
                <li
                  key={txn.transactionId ?? idx}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-white/1 transition-colors"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                    {style.icon}
                  </div>

                  {/* Description + date */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {txn.description || txn.transactionType}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(txn.createdAt)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-black tabular-nums ${style.text}`}>
                      {isCredit ? '+' : '-'}Rs.{Math.abs(txn.amount).toLocaleString()}
                    </p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                      {txn.transactionType}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}