import type { Metadata } from 'next';
import DemandForecastDashboard from '@/components/forecast/DemandForecastDashboard';

export const metadata: Metadata = {
  title: 'Demand Forecast | EventSphere',
  description: 'See how your ticket sales are expected to develop before your event.',
};

export default function DemandForecastPage() {
  return <DemandForecastDashboard />;
}
