'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Building2, Mail, Pencil, RefreshCw } from 'lucide-react';
import type { Organization } from '@/types/organization.types';
import { HERO_STATUS } from '../workspaceTheme';

interface Props {
  organization: Organization;
  refreshing: boolean;
  onEdit: () => void;
  onReload: () => void;
}

const CHIP = 'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 backdrop-blur-md';

// Same look as the Dashboard and Demand Forecast heroes, so all pages feel like one product.
export default function OrganizationHero({ organization, refreshing, onEdit, onReload }: Props) {
  const reduceMotion = useReducedMotion();
  const isActive = organization.status?.toUpperCase() === 'ACTIVE';
  const status = isActive ? HERO_STATUS.active : HERO_STATUS.warning;

  return (
    <div className="relative rounded-3xl bg-linear-to-br from-brand-950 via-brand-800 to-brand-900 p-6 text-white shadow-xl sm:p-8">
      {/* Decoration (clipped to the card) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-70"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        />
        <motion.div
          className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl"
          animate={reduceMotion ? undefined : { y: [0, 18, 0], x: [0, -12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-brand-400/25 blur-3xl"
          animate={reduceMotion ? undefined : { y: [0, -16, 0], x: [0, 14, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute -right-10 top-1/2 hidden size-72 -translate-y-1/2 rounded-full border-2 border-white/10 md:block" />
        <div className="absolute -right-2 top-1/2 hidden size-52 -translate-y-1/2 rounded-full border-2 border-white/10 md:block" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
          {/* Logo */}
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-xl ring-4 ring-white/20 sm:size-28">
            {organization.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={organization.imageUrl} alt={`${organization.name} logo`} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-10 w-10 text-brand-600" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`${CHIP} ${status.chip}`}>
                <span className="relative flex h-2 w-2">
                  {isActive && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${status.dot}`} />}
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${status.dot}`} />
                </span>
                {organization.status || 'UNKNOWN'}
              </span>
              <span className="text-sm font-medium text-white/70">My Organization</span>
            </div>

            <h2 className="mt-3 break-words text-3xl font-bold leading-tight tracking-tight lg:text-4xl" title={organization.name}>
              {organization.name}
            </h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/75">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{organization.email}</span>
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 lg:w-auto">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-300 px-6 text-sm font-bold text-brand-950 shadow-lg shadow-brand-950/30 transition hover:bg-brand-200 active:scale-[0.98] lg:flex-none"
          >
            <Pencil className="h-4 w-4" /> Edit Organization
          </button>
          <button
            type="button"
            onClick={onReload}
            disabled={refreshing}
            aria-label="Refresh organization"
            title="Refresh"
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border border-brand-300/30 bg-brand-400/15 text-brand-100 backdrop-blur-xl transition hover:bg-brand-400/25 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
