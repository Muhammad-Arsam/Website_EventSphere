'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChatPalette } from '../chatTheme';

const ROWS: { side: 'left' | 'right'; width: string; height: string }[] = [
  { side: 'right', width: '55%', height: '2.5rem' },
  { side: 'left', width: '78%', height: '4.5rem' },
  { side: 'right', width: '42%', height: '2.5rem' },
  { side: 'left', width: '66%', height: '3.5rem' },
];

export default function HistorySkeleton({ palette }: { palette: ChatPalette }) {
  const reduceMotion = useReducedMotion();

  return (
    <div role="status" aria-label="Loading previous messages" className="space-y-3 pt-1">
      {ROWS.map((row, i) => (
        <motion.div
          key={i}
          className={`${row.side === 'right' ? 'ml-auto rounded-br-md' : 'mr-auto rounded-bl-md'} rounded-2xl border`}
          style={{
            width: row.width,
            height: row.height,
            background: row.side === 'right' ? palette.chipBg : palette.botBubbleBg,
            borderColor: row.side === 'right' ? palette.chipBorder : palette.botBubbleBorder,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={reduceMotion ? { opacity: 0.7, y: 0 } : { opacity: [0.45, 0.95, 0.45], y: 0 }}
          transition={{ duration: 1.4, repeat: reduceMotion ? 0 : Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}