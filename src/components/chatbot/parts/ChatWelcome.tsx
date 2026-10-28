'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Hand, Sparkles } from 'lucide-react';

import { ChatPalette } from '../chatTheme';
import { SUGGESTIONS } from './chatConstants';

interface ChatWelcomeProps {
  palette: ChatPalette;
  eventTitle: string;
  onPick: (question: string) => void; // a suggestion chip was tapped
}

export default function ChatWelcome({ palette, eventTitle, onPick }: ChatWelcomeProps) {
  const reduceMotion = useReducedMotion();

  return (
        <motion.div
              exit={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.25 }}
          className="pb-1 pt-3 text-center"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: palette.gradient, color: palette.onGradient, boxShadow: `0 14px 34px -10px ${palette.glow}` }}
          >
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="h-7 w-7" />
            </motion.div>
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 text-lg font-bold"
          >
            Hi there!
            <motion.span
              className="inline-flex origin-[70%_70%]"
              style={{ color: palette.primary }}
              animate={reduceMotion ? undefined : { rotate: [0, 16, -8, 16, -4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.2, ease: 'easeInOut' }}
            >
              <Hand className="h-5 w-5" />
            </motion.span>
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-1 max-w-[280px] text-[13px] leading-relaxed"
            style={{ color: palette.muted }}
          >
            I&apos;m the assistant for <span className="font-semibold" style={{ color: palette.text }}>{eventTitle}</span>. Ask me about the schedule, venue, tickets and more.
          </motion.p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((q, i) => (
              <motion.button
                key={q}
                type="button"
                onClick={() => onPick(q)}
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.4 + i * 0.08 }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="rounded-full border px-3.5 py-2 text-xs font-semibold"
                style={{ background: palette.chipBg, borderColor: palette.chipBorder, color: palette.text }}
              >
                {q}
              </motion.button>
            ))}
          </div>
        </motion.div>
  );
}