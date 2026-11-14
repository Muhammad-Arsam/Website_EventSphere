import type { ReactNode } from 'react';
import { PANEL, type PanelTone } from '../dashboardTheme';

interface Props {
  tone: PanelTone;
  className?: string;
  children: ReactNode;
}

// The colored card used by every dashboard section (forest = deep green, mint = soft green).
export default function PanelShell({ tone, className = '', children }: Props) {
  return (
    <section className={`${PANEL[tone].card} flex flex-col p-5 sm:p-6 ${className}`}>
      {tone === 'forest' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          aria-hidden="true"
        />
      )}
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </section>
  );
}
