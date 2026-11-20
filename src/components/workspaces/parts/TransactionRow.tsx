'use client';

import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Repeat } from 'lucide-react';
import type { WalletTransaction } from '@/types/organization.types';
import { formatDateTime, getTransactionKind } from '../workspaceHelpers';
import { PANEL, formatRs } from '../workspaceShared';
import { TXN_STYLE } from '../workspaceTheme';

const S = PANEL.forest;
const ICONS = { credit: ArrowDownLeft, debit: ArrowUpRight, other: Repeat };

interface Props {
  transaction: WalletTransaction;
  index: number; // position on the page, for the staggered entrance
}

export default function TransactionRow({ transaction, index }: Props) {
  const kind = getTransactionKind(transaction.transactionType);
  const style = TXN_STYLE[kind];
  const Icon = ICONS[kind];
  const title = transaction.description || transaction.transactionType || 'Transaction';

  return (
    <motion.li
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.4) }}
      className="flex items-center gap-3 py-3.5 sm:gap-4"
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${style.bubble}`}>
        <Icon className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className={`line-clamp-2 break-words text-sm font-semibold ${S.strong}`} title={title}>{title}</span>
        <span className={`mt-0.5 block truncate text-xs ${S.muted}`}>{formatDateTime(transaction.createdAt)}</span>
      </span>

      <span className="shrink-0 text-right">
        <span className={`block text-sm font-bold tabular-nums sm:text-base ${style.amount}`}>
          {style.sign}{formatRs(Math.abs(Number(transaction.amount) || 0))}
        </span>
        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${style.chip}`}>
          {transaction.transactionType || style.label}
        </span>
      </span>
    </motion.li>
  );
}
