// The Demand Forecast page uses the same colored cards as the dashboard, so both pages look alike.
// They live behind this ONE file. If the kit is moved to a common folder later
// (for example components/shared), only this file needs to change.

export { default as PanelShell } from '@/components/ecommerce/parts/PanelShell';
export { default as PanelHeader } from '@/components/ecommerce/parts/PanelHeader';
export { default as PanelState } from '@/components/ecommerce/parts/PanelState';
export { default as KpiCard } from '@/components/ecommerce/parts/KpiCard';
export { PANEL } from '@/components/ecommerce/dashboardTheme';
