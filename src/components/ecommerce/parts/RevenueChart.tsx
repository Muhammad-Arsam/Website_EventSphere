'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import type { ApexOptions } from 'apexcharts';
import { useTheme } from '@/context/ThemeContext';
import { useElementWidth } from '@/hooks/useElementWidth';
import type { EventOrder } from '@/types/event.types';
import { formatInt, formatRs } from '../dashboardShared';
import { DASH_COLORS, PANEL } from '../dashboardTheme';
import {
  buildRevenueBuckets, buildRevenueSeries, formatCompactNumber, formatCompactRs, getBestDay, getOrderStats,
} from '../dashboardHelpers';
import PanelHeader from './PanelHeader';
import PanelShell from './PanelShell';
import PanelState from './PanelState';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div className="h-[340px] animate-pulse rounded-2xl bg-white/70 dark:bg-white/5" />,
});

type Mode = 'total' | 'bars';

const TONE = 'mint' as const;
const S = PANEL[TONE];

interface Props {
  orders: EventOrder[] | null;
  loading: boolean;
  error: string | null;
}

// REAL revenue over time, built from the event's paid orders (PAID / SUCCESS).
//  - "Total": running total, as a smooth area.
//  - "Per day / week / month": evenly spaced bars. The bar size is chosen automatically from the
//    length of the sales period, so a long period with one big day no longer gives hairline bars.
export default function RevenueChart({ orders, loading, error }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mode, setMode] = useState<Mode>('total');
  const { ref: chartBoxRef, width: chartWidth } = useElementWidth<HTMLDivElement>();

  const points = useMemo(() => buildRevenueSeries(orders ?? []), [orders]);
  const grouped = useMemo(() => buildRevenueBuckets(orders ?? []), [orders]);
  const stats = useMemo(() => getOrderStats(orders ?? []), [orders]);
  const bestDay = useMemo(() => getBestDay(points), [points]);
  const isBars = mode === 'bars';

  const bestBucket = useMemo(
    () => grouped.buckets.reduce((best, b, i, all) => (b.revenue > all[best].revenue ? i : best), 0),
    [grouped]
  );

  const series = useMemo(
    () => isBars
      ? [{ name: `Revenue per ${grouped.unit}`, data: grouped.buckets.map((b) => ({ x: b.label, y: b.revenue })) }]
      : [{ name: 'Total revenue', data: points.map((p) => ({ x: p.x, y: p.cumulative })) }],
    [isBars, grouped, points]
  );

  const options: ApexOptions = useMemo(() => {
    const text = isDark ? '#98a2b3' : '#475467';
    const line = isDark ? DASH_COLORS.brand300 : DASH_COLORS.brand700;
    const barBase = isDark ? DASH_COLORS.brand500 : DASH_COLORS.brand400;
    const barBest = isDark ? DASH_COLORS.brand300 : DASH_COLORS.brand700;
    const barCount = grouped.buckets.length;

    // Responsive x-axis: about 60px per label, never more than 12 labels.
    // Phone (~290px) -> 4 labels, tablet -> ~8, laptop -> 12 (same as before).
    const width = chartWidth || 360;
    const maxLabels = Math.min(12, Math.max(3, Math.floor(width / 60)));
    const labelStep = Math.max(1, Math.ceil(barCount / maxLabels));
    // Show every bar's value only when each bar has enough room, otherwise only the best bar's.
    const showAllValues = width / Math.max(barCount, 1) >= 30;

    return {
      chart: {
        type: isBars ? 'bar' : 'area', height: 340, fontFamily: 'Outfit, sans-serif', background: 'transparent',
        toolbar: { show: false }, zoom: { enabled: false }, animations: { speed: 800 },
      },
      theme: { mode: isDark ? 'dark' : 'light' },
      // In the bar chart the best bar is darker, so the highlight is easy to spot
      colors: isBars
        ? [({ dataPointIndex }: { dataPointIndex: number }) => (dataPointIndex === bestBucket ? barBest : barBase)]
        : [line],
      stroke: { width: isBars ? 0 : 3, curve: 'monotoneCubic', lineCap: 'round' },
      fill: isBars
        ? { type: 'solid', opacity: 1 }
        : { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.03, stops: [0, 95, 100] } },
      plotOptions: { bar: { columnWidth: barCount <= 6 ? '38%' : '62%', borderRadius: 7, borderRadiusApplication: 'end', dataLabels: { position: 'top' } } },
      // Small value above each bar (so small weeks are readable next to one very big week)
      dataLabels: isBars
        ? {
            enabled: true, offsetY: -20,
            formatter: (v: number, opts?: { dataPointIndex: number }) =>
              v > 0 && (showAllValues || opts?.dataPointIndex === bestBucket) ? formatCompactNumber(v) : '',
            style: { fontSize: '10px', fontWeight: 600, colors: [text] },
          }
        : { enabled: false },
      markers: { size: !isBars && points.length <= 2 ? 5 : 0, hover: { size: 6 } },
      grid: {
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(19,68,58,0.12)',
        strokeDashArray: 4, padding: { left: 8, right: 16 },
      },
      xaxis: isBars
        ? {
            type: 'category',
            axisBorder: { show: false }, axisTicks: { show: false }, tooltip: { enabled: false },
            labels: {
              style: { colors: text, fontSize: width < 480 ? '11px' : '12px' },
              rotate: 0,
              hideOverlappingLabels: true,
              // Show only every `labelStep`-th label, so labels never touch each other
              formatter: (value: string, _timestamp?: number, opts?: { i?: number }) =>
                (opts?.i ?? 0) % labelStep === 0 ? value : '',
            },
          }
        : {
            type: 'datetime',
            axisBorder: { show: false }, axisTicks: { show: false }, tooltip: { enabled: false },
            labels: { style: { colors: text }, datetimeUTC: false },
          },
      yaxis: { min: 0, labels: { style: { colors: text }, formatter: (v: number) => formatCompactRs(v) } },
      legend: { show: false },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        x: isBars
          ? { formatter: (_v: number, opts?: { dataPointIndex: number }) => grouped.buckets[opts?.dataPointIndex ?? 0]?.tooltip ?? '' }
          : { format: 'dd MMM yyyy' },
        y: {
          formatter: (v: number, opts?: { dataPointIndex: number }) => {
            if (!isBars) return formatRs(v);
            const orderCount = grouped.buckets[opts?.dataPointIndex ?? 0]?.orders ?? 0;
            return `${formatRs(v)} · ${orderCount} ${orderCount === 1 ? 'order' : 'orders'}`;
          },
        },
      },
    };
  }, [isDark, isBars, grouped, points.length, bestBucket, chartWidth]);

  const modes: { id: Mode; label: string }[] = [
    { id: 'total', label: 'Total' },
    { id: 'bars', label: `Per ${grouped.unit}` },
  ];

  const facts = [
    { label: 'Paid orders', value: formatInt(stats.counts.paid) },
    { label: 'Average order', value: formatRs(stats.averageOrderValue) },
    {
      label: 'Best day',
      value: bestDay
        ? `${new Date(bestDay.x).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · ${formatCompactRs(bestDay.daily)}`
        : '—',
    },
  ];

  return (
    <PanelShell tone={TONE}>
      <PanelHeader
        tone={TONE}
        title="Revenue over time"
        subtitle="Real revenue from paid orders"
        right={
          <div className="flex w-fit gap-1 rounded-2xl bg-white/70 p-1 ring-1 ring-brand-100 dark:bg-white/5 dark:ring-white/10" role="tablist" aria-label="Chart mode">
            {modes.map((m) => {
              const active = m.id === mode;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMode(m.id)}
                  className={`relative rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    active ? 'text-white' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="revenue-mode-pill"
                      className="absolute inset-0 rounded-xl bg-linear-to-r from-brand-500 to-brand-700 shadow-md"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{m.label}</span>
                </button>
              );
            })}
          </div>
        }
      />

      <PanelState
        tone={TONE}
        loading={loading}
        error={error}
        isEmpty={points.length === 0}
        emptyTitle="No paid orders yet"
        emptyText="Revenue will appear here as soon as the first order is paid."
        height={340}
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {facts.map((f, i) => (
            <div key={f.label} className={`rounded-2xl p-3.5 ${S.tile} ${i === 2 ? 'col-span-2 sm:col-span-1' : ''}`}>
              <p className={`text-[11px] ${S.muted}`}>{f.label}</p>
              <p className={`mt-0.5 truncate text-sm font-bold sm:text-base ${S.strong}`}>{f.value}</p>
            </div>
          ))}
        </div>
        <div ref={chartBoxRef}>
          <ReactApexChart key={`${mode}-${theme}`} type={isBars ? 'bar' : 'area'} height={340} series={series} options={options} />
        </div>
        <p className={`mt-3 text-xs ${S.muted}`}>
          Counts orders with status Paid or Success ({formatInt(stats.counts.paid)} of {formatInt(stats.total)} orders).
          {isBars && ` Each bar is one ${grouped.unit}; the darkest bar is the best ${grouped.unit}.`}
        </p>
      </PanelState>
    </PanelShell>
  );
}
