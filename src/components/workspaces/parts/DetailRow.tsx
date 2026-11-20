import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { PANEL } from '../workspaceShared';

interface Props {
  icon: LucideIcon;
  label: string;
  children: ReactNode; // the value
  hint?: string;
}

const S = PANEL.mint;

// One line in the "Organization details" card: icon, small label, value.
export default function DetailRow({ icon: Icon, label, children, hint }: Props) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl p-4 ${S.tile}`}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-brand-400 to-brand-600 text-white shadow-md shadow-brand-600/25">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-semibold uppercase tracking-wider ${S.muted}`}>{label}</p>
        <div className={`mt-1 truncate text-sm font-bold ${S.strong}`}>{children}</div>
        {hint && <p className={`mt-0.5 text-xs ${S.muted}`}>{hint}</p>}
      </div>
    </div>
  );
}
