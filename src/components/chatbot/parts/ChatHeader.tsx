'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bot, SquarePen, Sparkles, X } from 'lucide-react';

import { ChatPalette } from '../chatTheme';

interface ChatHeaderProps {
  palette: ChatPalette;
  eventTitle: string;
  eventImageUrl?: string;
  showNewChat: boolean; // the "New chat" button is shown only when there are messages
  onNewChat: () => void;
  onClose: () => void;
}

export default function ChatHeader({ palette, eventTitle, eventImageUrl, showNewChat, onNewChat, onClose }: ChatHeaderProps) {
  const reduceMotion = useReducedMotion();
  const [imageFailed, setImageFailed] = useState(false);

  return (
        <div className="relative shrink-0 overflow-hidden px-5 pb-4 pt-5" style={{ background: palette.gradient, color: palette.onGradient }}>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/20 blur-2xl"
            animate={reduceMotion ? undefined : { scale: [1, 1.2, 1], x: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-14 left-10 h-32 w-32 rounded-full bg-black/10 blur-2xl"
            animate={reduceMotion ? undefined : { scale: [1, 1.3, 1], y: [0, -8, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="h-11 w-11 overflow-hidden rounded-2xl border-2 border-white/40 bg-white/20 flex items-center justify-center shadow-lg">
                {eventImageUrl && !imageFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={eventImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <Bot className="h-5 w-5" />
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold leading-tight">{eventTitle}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs opacity-85">
                <Sparkles className="h-3 w-3" /> AI Event Assistant · Online
              </p>
            </div>

            <AnimatePresence>
              {showNewChat && (
                <motion.button
                  key="new-chat"
                  type="button"
                  onClick={onNewChat}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                  aria-label="Start a new chat"
                  title="New chat"
                >
                  <SquarePen className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
  );
}