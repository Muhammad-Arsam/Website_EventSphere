// Everything this page shares with the Dashboard and Demand Forecast pages lives behind this ONE file,
// so all pages look the same. Same idea as ecommerce/dashboardShared.ts.

export { default as PanelShell } from '@/components/ecommerce/parts/PanelShell';
export { default as PanelHeader } from '@/components/ecommerce/parts/PanelHeader';
export { default as PanelState } from '@/components/ecommerce/parts/PanelState';
export { default as KpiCard } from '@/components/ecommerce/parts/KpiCard';

export { PANEL, ORDER_BADGE } from '@/components/ecommerce/dashboardTheme';
export type { PanelTone, OrderBucket } from '@/components/ecommerce/dashboardTheme';

export { Reveal, StatusMessage, formatRs, formatInt } from '@/components/ecommerce/dashboardShared';
