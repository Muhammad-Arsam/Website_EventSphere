import type { ReactNode } from 'react';
import { PANEL, type PanelTone } from '../dashboardTheme';

interface Props {
  tone: PanelTone;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export default function PanelHeader({ tone, title, subtitle, right }: Props) {
  const s = PANEL[tone];
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h3 className={`text-lg font-bold tracking-tight ${s.title}`}>{title}</h3>
        {subtitle && <p className={`mt-0.5 text-sm ${s.subtitle}`}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
