'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, RotateCcw } from 'lucide-react';

import { ChatPalette, withAlpha } from '../chatTheme';
import TypingIndicator from '../TypingIndicator';
import MessageBubble from './MessageBubble';
import ChatWelcome from './ChatWelcome';
import HistorySkeleton from './HistorySkeleton';
import { ChatMsg } from './types';
import type { HistoryStatus } from './useEventChat';

interface ChatMessagesProps {
  palette: ChatPalette;
  eventTitle: string;
  messages: ChatMsg[];
  isPending: boolean;
  historyStatus: HistoryStatus;
  onRetryHistory: () => void;
  onPick: (question: string) => void;
  onTypingDone: (id: string) => void;
  onHandoffFinished: (id: string) => void;
  onRetry: (msg: ChatMsg) => void;
}

// The scrolling message area: decorative background, welcome screen, bubbles and the loader.
export default function ChatMessages({
  palette,
  eventTitle,
  messages,
  isPending,
  historyStatus,
  onRetryHistory,
  onPick,
  onTypingDone,
  onHandoffFinished,
  onRetry,
}: ChatMessagesProps) {
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(
    (smooth = true) => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
    },
    [reduceMotion],
  );

  // used by the typing animation to keep the newest text in view
  const keepBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // new message or loader: scroll down
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isPending, scrollToBottom]);

  // when the panel opens: jump to the latest message
  useEffect(() => {
    const jump = setTimeout(() => scrollToBottom(false), 60);
    return () => clearTimeout(jump);
  }, [scrollToBottom]);

  // previous messages arrived: jump to the latest one (no slow scroll through the whole chat)
  useEffect(() => {
    if (historyStatus !== 'ready') return;
    const jump = setTimeout(() => scrollToBottom(false), 60);
    return () => clearTimeout(jump);
  }, [historyStatus, scrollToBottom]);

  const historyLoading = historyStatus === 'loading';
  const historyFailed = historyStatus === 'error' && messages.length === 0;
  const showWelcome = messages.length === 0 && !isPending && !historyLoading;

  return (
    <div className="relative min-h-0 flex-1">
      {/* decorative background: dot grid + slow floating glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: palette.dotPattern, backgroundSize: '18px 18px' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-1/4 h-56 w-56 rounded-full blur-3xl"
        style={{ background: withAlpha(palette.primary, palette.isDark ? 0.28 : 0.30) }}
        animate={reduceMotion ? undefined : { x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-10 h-56 w-56 rounded-full blur-3xl"
        style={{ background: withAlpha(palette.secondary, palette.isDark ? 0.24 : 0.28) }}
        animate={reduceMotion ? undefined : { x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div
        ref={scrollRef}
        className="absolute inset-0 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20"
        aria-live="polite"
      >
        {historyLoading && <HistorySkeleton palette={palette} />}

        {historyFailed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 text-xs"
            style={{ background: palette.errorBg, borderColor: palette.errorBorder, color: palette.errorText }}
          >
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Couldn&apos;t load your previous messages.
            </span>
            <button
              type="button"
              onClick={onRetryHistory}
              className="flex shrink-0 items-center gap-1 font-semibold underline underline-offset-2"
            >
              <RotateCcw className="h-3 w-3" /> Try again
            </button>
          </motion.div>
        )}

        <AnimatePresence>
          {showWelcome && <ChatWelcome key="welcome" palette={palette} eventTitle={eventTitle} onPick={onPick} />}
        </AnimatePresence>

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            palette={palette}
            onProgress={keepBottom}
            onTypingDone={onTypingDone}
            onHandoffFinished={onHandoffFinished}
            onRetry={onRetry}
          />
        ))}

        <AnimatePresence>{isPending && <TypingIndicator key="typing" palette={palette} />}</AnimatePresence>
      </div>
    </div>
  );
}