'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import type { EventAnalytics } from '@/types/analytics.types';
import { AnimatedNumber, formatInt, formatPct } from '../dashboardShared';
import { DASH_COLORS, PANEL } from '../dashboardTheme';
import { getRates } from '../dashboardHelpers';
import PanelHeader from './PanelHeader';
import PanelShell from './PanelShell';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div className="mx-auto h-[260px] w-[260px] animate-pulse rounded-full bg-white/10" />,
});

const TONE = 'forest' as const;
const S = PANEL[TONE];

// Checked in / pending entry / unsold, as a donut with the capacity in the middle.
// This card is always dark green, so the chart always uses light text.
export default function AttendanceDonut({ analytics }: { analytics: EventAnalytics }) {
  const { unsold } = getRates(analytics);
  const capacity = analytics.totalCapacity;

  const segments = useMemo(
    () => [
      { label: 'Checked in', value: analytics.totalCheckedIn, color: DASH_COLORS.brand300 },
      { label: 'Pending entry', value: analytics.totalPendingEntry, color: DASH_COLORS.amberLight },
      { label: 'Unsold', value: unsold, color: DASH_COLORS.unsoldOnDark },
    ],
    [analytics.totalCheckedIn, analytics.totalPendingEntry, unsold]
  );

  const options: ApexOptions = useMemo(() => ({
    chart: { type: 'donut', height: 260, fontFamily: 'Outfit, sans-serif', background: 'transparent', animations: { speed: 800 } },
    theme: { mode: 'dark' },
    labels: segments.map((s) => s.label),
    colors: segments.map((s) => s.color),
    stroke: { width: 3, colors: ['transparent'] },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => `${formatInt(v)} tickets` } },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: '76%',
          labels: {
            show: true,
            name: { show: true, color: '#aee0d4', fontSize: '13px', offsetY: -6 },
            value: {
              show: true, fontSize: '30px', fontWeight: 700, offsetY: 6, color: '#ffffff',
              formatter: (v: string) => formatInt(Number(v)),
            },
            total: {
              show: true, showAlways: true, label: 'Capacity', color: '#ffffff', fontSize: '13px',
              formatter: () => formatInt(capacity),
            },
          },
        },
      },
    },
  }), [segments, capacity]);

  return (
    <PanelShell tone={TONE}>
      <PanelHeader tone={TONE} title="Attendance breakdown" subtitle="Checked in, pending entry and unsold tickets" />

      {capacity > 0 ? (
        // globals.css forces all ApexCharts text to gray, which is unreadable on this dark card,
        // so the two centre texts are re-coloured here (only for this chart).
        <div className="[&_.apexcharts-datalabel-label]:fill-brand-200! [&_.apexcharts-datalabel-value]:fill-white!">
          <ReactApexChart type="donut" height={260} series={segments.map((s) => s.value)} options={options} />
        </div>
      ) : (
        <p className={`py-16 text-center text-sm ${S.muted}`}>No capacity has been set for this event.</p>
      )}

      <ul className="mt-4 grid gap-2">
        {segments.map((s) => (
          <li key={s.label} className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 ${S.tile}`}>
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className={`flex-1 text-sm ${S.body}`}>{s.label}</span>
            <span className={`text-sm font-bold ${S.strong}`}>
              <AnimatedNumber value={s.value} />
            </span>
            <span className={`w-14 text-right text-xs ${S.muted}`}>
              {formatPct(capacity ? (s.value / capacity) * 100 : 0)}
            </span>
          </li>
        ))}
      </ul>
    </PanelShell>
  );
}
