'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bot, Sparkles, X } from 'lucide-react';

import { ChatPalette } from '../chatTheme';

interface ChatLauncherProps {
  palette: ChatPalette;
  open: boolean;
  onOpen: () => void;
  onToggle: () => void;
}

export default function ChatLauncher({ palette, open, onOpen, onToggle }: ChatLauncherProps) {
  const reduceMotion = useReducedMotion();
  const [showHint, setShowHint] = useState(false);

  // hint bubble next to the button: appears after 3.5s, disappears after 12s or when the chat opens
  useEffect(() => {
    if (open) return;
    const show = setTimeout(() => setShowHint(true), 3500);
    const hide = setTimeout(() => setShowHint(false), 12000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
      setShowHint(false); // reset when the chat opens (or the widget goes away)
    };
  }, [open]);

  return (
      <div className="fixed bottom-24 right-4 z-9000 flex items-center gap-3 sm:bottom-6 sm:right-6">
        <AnimatePresence>
          {showHint && !open && (
            <motion.button
              key="hint"
              type="button"
              onClick={onOpen}
              initial={{ opacity: 0, x: 16, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="hidden items-center gap-2 whitespace-nowrap rounded-2xl rounded-br-md border px-4 py-2.5 text-sm font-semibold shadow-xl backdrop-blur-xl sm:flex"
              style={{ background: palette.panelBg, borderColor: palette.panelBorder, color: palette.text }}
            >
              <Sparkles className="h-4 w-4" style={{ color: palette.primary }} />
              Have a question? Ask me!
            </motion.button>
          )}
        </AnimatePresence>

        <div className="relative">
          {!open && !reduceMotion && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ background: palette.gradient }}
              animate={{ scale: [1, 1.7], opacity: [0.45, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
          <motion.button
            type="button"
            onClick={onToggle}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.6 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            className="relative flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: palette.gradient,
              color: palette.onGradient,
              boxShadow: `0 16px 40px -10px ${palette.glow}, 0 0 0 1px rgba(255,255,255,0.15) inset`,
            }}
            aria-label={open ? 'Close chat' : 'Open chat assistant'}
            aria-expanded={open}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? 'close' : 'open'}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.18 }}
                className="flex"
              >
                {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
  );
}