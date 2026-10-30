'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import type { ApexOptions } from 'apexcharts';
import { useTheme } from '@/context/ThemeContext';
import type { DemandForecast } from '@/types/analytics.types';
import { buildTrajectory, getViewMeta, type ChartPoint } from '../forecastHelpers';
import { CARD, CHART_COLORS } from '../forecastTheme';
import SectionHeader from './SectionHeader';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div className="h-[360px] animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />,
});

interface Props {
  forecast: DemandForecast;
  activeTierId: string;
  onSelectTier: (tierId: string) => void;
}

// Picks a "nice" top value and tick count (e.g. 125 with ticks every 25) instead of odd numbers like 108.
const niceAxis = (value: number): { max: number; ticks: number } => {
  const target = Math.max(value, 1) * 1.05;
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000];
  const step = steps.find((st) => target / st <= 5) ?? Math.ceil(target / 5);
  const max = Math.ceil(target / step) * step;
  return { max, ticks: max / step };
};

interface Layer {
  name: string;
  color: string;
  data: ChartPoint[];
  width: number;
  curve: 'stepline' | 'straight';
  dash: number;
  gradient: boolean;
}

export default function TrajectoryChart({ forecast, activeTierId, onSelectTier }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const tier = forecast.predictions.find((t) => t.tierId === activeTierId) ?? forecast.predictions[0];
  const isBacktest = getViewMeta(forecast.viewType).kind === 'backtest';

  const { series, options } = useMemo(() => {
    const t = buildTrajectory(forecast, tier);

    // Only draw the lines that have data (the "what really happened" line exists for backtests only)
    const allLayers: Layer[] = [
      { name: 'Actual sales', color: CHART_COLORS.actual, data: t.actual, width: 3, curve: 'stepline', dash: 0, gradient: true },
      { name: 'Model projection', color: CHART_COLORS.model, data: t.model, width: 3, curve: 'straight', dash: 7, gradient: true },
      { name: 'Naive baseline', color: CHART_COLORS.naive, data: t.naive, width: 2.5, curve: 'straight', dash: 4, gradient: false },
      { name: 'What really happened', color: CHART_COLORS.outcome, data: t.outcome, width: 3, curve: 'stepline', dash: 0, gradient: false },
    ];
    const layers = allLayers.filter((l) => l.data.length > 0);

    const highest = Math.max(t.capacity, ...layers.flatMap((l) => l.data.map((p) => p.y)));
    const axis = niceAxis(highest);
    const text = isDark ? '#98a2b3' : '#667085';
    const labelStyle = { fontSize: '11px', fontWeight: 600 };

    const options: ApexOptions = {
      chart: {
        type: 'area',
        height: 360,
        fontFamily: 'Outfit, sans-serif',
        background: 'transparent',
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true, speed: 800 },
      },
      theme: { mode: isDark ? 'dark' : 'light' },
      colors: layers.map((l) => l.color),
      stroke: {
        width: layers.map((l) => l.width),
        curve: layers.map((l) => l.curve),
        dashArray: layers.map((l) => l.dash),
        lineCap: 'round',
      },
      fill: {
        type: layers.map((l) => (l.gradient ? 'gradient' : 'solid')),
        opacity: layers.map((l) => (l.gradient ? 1 : 0)),
        gradient: { shadeIntensity: 1, opacityFrom: 0.32, opacityTo: 0.02, stops: [0, 95, 100] },
      },
      dataLabels: { enabled: false },
      markers: { size: 0, hover: { size: 5 } },
      grid: {
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#eef0f3',
        strokeDashArray: 4,
        padding: { left: 8, right: 24 },
      },
      xaxis: {
        type: 'datetime',
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
        labels: { style: { colors: text }, datetimeUTC: true },
      },
      yaxis: {
        min: 0,
        max: axis.max,
        tickAmount: axis.ticks,
        labels: { style: { colors: text }, formatter: (v: number) => String(Math.round(v)) },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '12px',
        labels: { colors: text },
        markers: { size: 6, strokeWidth: 0 },
        itemMargin: { horizontal: 10 },
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        x: { format: 'dd MMM yyyy' },
        y: { formatter: (v: number) => `${Math.round(v)} tickets` },
      },
      annotations: {
        yaxis: [
          {
            y: t.capacity,
            borderColor: CHART_COLORS.capacity,
            strokeDashArray: 3,
            label: {
              text: `Capacity ${t.capacity}`,
              position: 'left',
              textAnchor: 'start',
              borderColor: 'transparent',
              style: { ...labelStyle, color: text, background: 'transparent' },
            },
          },
        ],
        xaxis: [
          {
            x: t.asOfTs,
            borderColor: isDark ? '#667085' : '#98a2b3',
            strokeDashArray: 4,
            label: {
              text: isBacktest ? 'Forecast made' : 'Today',
              position: 'top',
              textAnchor: 'end',
              offsetY: 0,
              orientation: 'horizontal',
              borderColor: 'transparent',
              style: { ...labelStyle, color: isDark ? '#e4e7ec' : '#344054', background: isDark ? '#344054' : '#f2f4f7' },
            },
          },
          {
            x: t.eventTs,
            borderColor: CHART_COLORS.model,
            strokeDashArray: 4,
            label: {
              text: 'Target date',
              position: 'top',
              textAnchor: 'end',
              offsetY: 24,
              orientation: 'horizontal',
              borderColor: 'transparent',
              style: { ...labelStyle, color: '#fff', background: CHART_COLORS.model },
            },
          },
        ],
      },
    };

    return { series: layers.map((l) => ({ name: l.name, data: l.data })), options };
  }, [forecast, tier, isDark, isBacktest]);

  return (
    <section className={`${CARD} p-5 sm:p-6`}>
      <SectionHeader
        title="Sales trajectory"
        subtitle="Cumulative tickets sold: what happened, and where the model expects it to go."
        right={
          <div className="-mx-1 flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-gray-100 p-1 dark:bg-white/5" role="tablist" aria-label="Choose a ticket tier">
            {forecast.predictions.map((t) => {
              const active = t.tierId === tier.tierId;
              return (
                <button
                  key={t.tierId}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelectTier(t.tierId)}
                  className={`relative shrink-0 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    active ? 'text-white' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="forecast-tier-pill"
                      className="absolute inset-0 rounded-xl bg-linear-to-r from-brand-500 to-brand-700 shadow-md"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{t.tierName}</span>
                </button>
              );
            })}
          </div>
        }
      />

      <ReactApexChart
        key={`${tier.tierId}-${theme}`}
        type="area"
        height={360}
        series={series}
        options={options}
      />

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Values are running totals, not daily sales. The naive baseline is the simple estimate the model is compared against.
      </p>
    </section>
  );
}
