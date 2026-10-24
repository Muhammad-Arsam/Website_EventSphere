'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ChatPalette } from './chatTheme';

export function BotAvatar({ palette, size = 28 }: { palette: ChatPalette; size?: number }) {
  return (
    <div
      className="shrink-0 rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: palette.gradient,
        color: palette.onGradient,
        boxShadow: `0 4px 14px -4px ${palette.glow}`,
      }}
    >
      <Sparkles style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
}

const PHRASES = ['Checking the event details…', 'Looking that up for you…', 'Almost there…'];

export default function TypingIndicator({ palette }: { palette: ChatPalette }) {
  const reduceMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setPhraseIndex((i) => (i + 1) % PHRASES.length), 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="flex items-end gap-2"
      role="status"
      aria-label="The assistant is typing"
    >
      <BotAvatar palette={palette} />
      <div
        className="rounded-2xl rounded-bl-md px-4 py-3 border backdrop-blur-sm"
        style={{ background: palette.botBubbleBg, borderColor: palette.botBubbleBorder }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          {[0, 1, 2].map((n) => (
            <motion.span
              key={n}
              className="block h-2 w-2 rounded-full"
              style={{ background: palette.gradient }}
              animate={reduceMotion ? undefined : { y: [0, -6, 0], opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: n * 0.15, ease: 'easeInOut' }}
            />
          ))}
        </div>

        {/* shimmer bar */}
        <div className="relative h-1 w-28 overflow-hidden rounded-full mb-2" style={{ background: palette.botBubbleBorder }}>
          {!reduceMotion && (
            <motion.div
              className="absolute inset-y-0 w-1/2 rounded-full"
              style={{ background: palette.gradient }}
              animate={{ x: ['-100%', '220%'] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="text-xs"
            style={{ color: palette.muted }}
          >
            {PHRASES[phraseIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}