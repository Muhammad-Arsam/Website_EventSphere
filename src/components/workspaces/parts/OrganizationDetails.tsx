'use client';

import { BadgeCheck, CalendarClock, CalendarPlus, ShieldCheck } from 'lucide-react';
import type { Organization } from '@/types/organization.types';
import { formatDate, getRenewalInfo, getStatusBucket } from '../workspaceHelpers';
import { ORDER_BADGE, PanelHeader, PanelShell } from '../workspaceShared';
import DetailRow from './DetailRow';

const TONE = 'mint' as const;

const Badge = ({ value }: { value?: string }) => {
  const badge = ORDER_BADGE[getStatusBucket(value)];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${badge.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
      {value || 'N/A'}
    </span>
  );
};

// Status, subscription and dates of the organization (soft green card).
export default function OrganizationDetails({ organization }: { organization: Organization }) {
  const renewal = getRenewalInfo(organization.subscriptionEndDate);

  return (
    <PanelShell tone={TONE}>
      <PanelHeader tone={TONE} title="Organization details" subtitle="Account status and subscription" />

      <div className="flex flex-col gap-3">
        <DetailRow icon={ShieldCheck} label="Account status">
          <Badge value={organization.status} />
        </DetailRow>

        <DetailRow icon={BadgeCheck} label="Subscription">
          <Badge value={organization.subscriptionStatus} />
        </DetailRow>

        <DetailRow icon={CalendarClock} label="Renewal date" hint={renewal.hint || undefined}>
          {renewal.date}
        </DetailRow>

        <DetailRow icon={CalendarPlus} label="Member since">
          {formatDate(organization.createdAt)}
        </DetailRow>
      </div>
    </PanelShell>
  );
}
