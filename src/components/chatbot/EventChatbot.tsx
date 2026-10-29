'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { FONT_MAP, buildChatPalette } from './chatTheme';
import { useEventChat } from './parts/useEventChat';
import ChatHeader from './parts/ChatHeader';
import ChatMessages from './parts/ChatMessages';
import ChatInput from './parts/ChatInput';
import ChatLauncher from './parts/ChatLauncher';

export interface EventChatbotProps {
  eventId: string;
  eventTitle: string;
  eventImageUrl?: string;
  organizerPhone?: string;
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor?: string;
  fontStyle?: string;
}

// The chat widget: floating button + chat panel.
// Logic lives in parts/useEventChat.ts, the screen pieces live in parts/.
export default function EventChatbot({
  eventId,
  eventTitle,
  eventImageUrl,
  organizerPhone,
  primaryColor,
  secondaryColor,
  backgroundColor,
  fontStyle,
}: EventChatbotProps) {
  const reduceMotion = useReducedMotion();
  const palette = buildChatPalette(primaryColor, secondaryColor, backgroundColor);
  const fontFamily = (fontStyle && FONT_MAP[fontStyle]) || 'inherit';

  const [open, setOpen] = useState(false);

  const chat = useEventChat({ eventId, eventTitle, organizerPhone });
  const { settleMessages } = chat;

  // closing: do not replay typing or auto-open WhatsApp when the panel is opened again
  const closePanel = useCallback(() => {
    setOpen(false);
    settleMessages();
  }, [settleMessages]);

  // opening: show the panel and load the earlier messages of this visitor (if any)
  const { loadHistory } = chat;
  const openPanel = () => {
    setOpen(true);
    loadHistory();
  };

  const togglePanel = () => (open ? closePanel() : openPanel());

  // Esc closes, and the page behind does not scroll when the panel is full screen (mobile)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', onKey);

    const isMobile = window.matchMedia('(max-width: 639px)').matches;
    const previousOverflow = document.body.style.overflow;
    if (isMobile) document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, closePanel]);

  return (
    <div style={{ fontFamily }}>
      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            role="dialog"
            aria-label={`${eventTitle} assistant`}
            initial={{ opacity: 0, y: 40, scale: reduceMotion ? 1 : 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: reduceMotion ? 1 : 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 top-0 bottom-0 h-dvh z-9001 flex flex-col overflow-hidden border backdrop-blur-2xl sm:inset-auto sm:right-6 sm:bottom-24 sm:h-[620px] sm:max-h-[calc(100dvh-7.5rem)] sm:w-[400px] sm:rounded-[28px]"
            style={{
              background: palette.panelBackground,
              borderColor: palette.panelBorder,
              boxShadow: palette.panelShadow,
              color: palette.text,
              transformOrigin: 'bottom right',
            }}
          >
            <ChatHeader
              palette={palette}
              eventTitle={eventTitle}
              eventImageUrl={eventImageUrl}
              showNewChat={chat.messages.length > 0}
              onNewChat={chat.startNewChat}
              onClose={closePanel}
            />

            <ChatMessages
              palette={palette}
              eventTitle={eventTitle}
              messages={chat.messages}
              isPending={chat.isPending}
              historyStatus={chat.historyStatus}
              onRetryHistory={chat.loadHistory}
              onPick={chat.send}
              onTypingDone={chat.handleTypingDone}
              onHandoffFinished={chat.handleHandoffFinished}
              onRetry={chat.handleRetry}
            />

            <ChatInput
              palette={palette}
              value={chat.input}
              onChange={chat.setInput}
              onSend={() => chat.send(chat.input)}
              isPending={chat.isPending}
              disabled={chat.historyStatus === 'loading'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating button ── */}
      <ChatLauncher palette={palette} open={open} onOpen={openPanel} onToggle={togglePanel} />
    </div>
  );
}