import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';

interface ExploreLayoutProps {
  children: React.ReactNode;
  showBrowseLink?: boolean;
}

export default function ExploreLayout({ children }: ExploreLayoutProps) {
  return <div className="relative">{children}</div>;
}