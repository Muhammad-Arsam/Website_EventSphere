import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';

interface ExploreLayoutProps {
  children: React.ReactNode;
  showBrowseLink?: boolean;
}

export default function ExploreLayout({
  children,
  showBrowseLink = true,
}: ExploreLayoutProps) {
  return (
    <div className="relative">
      {showBrowseLink && (
        <div className="absolute top-6 left-6 sm:left-10 lg:left-12 z-50">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition-all -translate-y-1 hover:-translate-y-1.5"
          >
            <LayoutGrid className="w-4 h-4" />
            More From Eventsphere
          </Link>
        </div>
      )}

      {children}
    </div>
  );
}