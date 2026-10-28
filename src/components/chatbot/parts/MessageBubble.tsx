'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw } from 'lucide-react';

import { ChatPalette } from '../chatTheme';
import { BotAvatar } from '../TypingIndicator';
import TypewriterText from '../TypewriterText';
import WhatsAppHandoff from '../WhatsAppHandoff';
import { ChatMsg } from './types';

const formatTime = (ms: number) =>
  new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(ms));

// ─── One chat bubble ──────────────────────────────────────────────────────────
interface MessageBubbleProps {
  msg: ChatMsg;
  palette: ChatPalette;
  onProgress: () => void;
  onTypingDone: (id: string) => void;
  onHandoffFinished: (id: string) => void;
  onRetry: (msg: ChatMsg) => void;
}

export default function MessageBubble({ msg, palette, onProgress, onTypingDone, onHandoffFinished, onRetry }: MessageBubbleProps) {
  if (msg.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 24, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="flex flex-col items-end"
      >
        <div
          className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-[14px] leading-relaxed shadow-lg"
          style={{
            background: palette.gradient,
            color: palette.onGradient,
            boxShadow: `0 8px 24px -10px ${palette.glow}`,
          }}
        >
          <span className="whitespace-pre-wrap wrap-break-word">{msg.text}</span>
        </div>
        <span className="mt-1 mr-1 text-[10px]" style={{ color: palette.muted }}>
          {formatTime(msg.time)}
        </span>
      </motion.div>
    );
  }

  const isError = msg.kind === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
    >
      <div className="flex items-end gap-2">
        <BotAvatar palette={palette} />
        <div className="flex flex-col items-start max-w-[85%]">
          <div
            className="rounded-2xl rounded-bl-md px-4 py-2.5 text-[14px] leading-relaxed border backdrop-blur-sm"
            style={
              isError
                ? { background: palette.errorBg, borderColor: palette.errorBorder, color: palette.errorText }
                : { background: palette.botBubbleBg, borderColor: palette.botBubbleBorder, color: palette.text, boxShadow: palette.botBubbleShadow }
            }
          >
            {isError && (
              <span className="flex items-center gap-1.5 text-xs font-bold mb-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Something went wrong
              </span>
            )}
            <TypewriterText
              text={msg.text}
              animate={!!msg.animate}
              caretColor={palette.primary}
              onProgress={onProgress}
              onDone={() => onTypingDone(msg.id)}
            />
            {msg.retryText && (
              <button
                type="button"
                onClick={() => onRetry(msg)}
                className="mt-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ borderColor: palette.errorBorder, color: palette.errorText }}
              >
                <RotateCcw className="w-3 h-3" /> Try again
              </button>
            )}
          </div>
          <span className="mt-1 ml-1 text-[10px]" style={{ color: palette.muted }}>
            {formatTime(msg.time)}
          </span>
        </div>
      </div>

      {msg.handoffLink && (
        <WhatsAppHandoff
          link={msg.handoffLink}
          autoOpen={!!msg.autoOpen}
          onFinished={() => onHandoffFinished(msg.id)}
          muted={palette.muted}
          borderColor={palette.botBubbleBorder}
        />
      )}
    </motion.div>
  );
}