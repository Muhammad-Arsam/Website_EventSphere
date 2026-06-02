import type { Metadata } from 'next';
import OrdersPageClient from './OrdersPageClient';

export const metadata: Metadata = {
  title: 'Orders — Eventsphere',
  description: 'View and manage orders for your events.',
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}