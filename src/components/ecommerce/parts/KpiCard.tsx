'use client';

import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedNumber, formatInt } from '../dashboardShared';
import { KPI_GRADIENTS } from '../dashboardTheme';

interface Props {
  label: string;
  caption: string;
  icon: LucideIcon;
  value: number | null; // null while loading
  format?: (n: number) => string;
  prefix?: string; // small text before the number, for example "Rs."
  index: number; // for the colour and the staggered entrance
}

// The number must always stay on ONE line, at any card width. The card is a "container"
// (@container), so the font size is calculated from the card's width (cqw) and from how many
// characters the number has: long numbers get a smaller font, short numbers a bigger one.
// The small prefix counts as about half a character.
const valueFontSize = (text: string, prefix?: string) => {
  const chars = Math.max(text.length + (prefix ? prefix.length * 0.55 : 0), 3);
  const cqw = Math.min(40, 92 / (chars * 0.58));
  return `clamp(1.05rem, ${cqw.toFixed(1)}cqw, 1.8rem)`;
};

export default function KpiCard({ label, caption, icon: Icon, value, format = formatInt, prefix, index }: Props) {
  const gradient = KPI_GRADIENTS[index % KPI_GRADIENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={`group @container relative overflow-hidden rounded-3xl bg-linear-to-br p-5 text-white shadow-lg shadow-brand-950/20 ring-1 ring-white/10 transition-shadow hover:shadow-xl ${gradient}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)', backgroundSize: '18px 18px' }}
        aria-hidden="true"
      />
      <Icon
        className="pointer-events-none absolute -bottom-5 -right-5 h-28 w-28 text-white/10 transition-transform duration-500 group-hover:scale-110"
        strokeWidth={1.2}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-white/80">{label}</span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20">
            <Icon className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-4 flex h-9 items-center">
          {value === null ? (
            <Loader2 className="h-6 w-6 animate-spin text-white/80" aria-label="Loading" />
          ) : (
            <h3
              className="whitespace-nowrap font-bold leading-none tracking-tight"
              style={{ fontSize: valueFontSize(format(value), prefix) }}
            >
              {prefix && <span className="mr-[0.3em] text-[0.55em] font-semibold text-white/75">{prefix}</span>}
              <AnimatedNumber value={value} format={format} />
            </h3>
          )}
        </div>

        <p className="mt-3 truncate text-sm text-white/65">{caption}</p>
      </div>
    </motion.div>
  );
}
