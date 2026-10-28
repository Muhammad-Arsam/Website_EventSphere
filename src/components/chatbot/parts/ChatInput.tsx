'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

import { ChatPalette, withAlpha } from '../chatTheme';
import { MAX_MESSAGE_LENGTH } from './chatConstants';

interface ChatInputProps {
  palette: ChatPalette;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isPending: boolean;
}

export default function ChatInput({ palette, value, onChange, onSend, isPending }: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // focus the input when the panel opens (this component mounts when the panel opens)
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  // textarea grows with the text, up to 4 lines
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = value.trim().length > 0 && !isPending;

  return (
        <div
          className="shrink-0 border-t px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl"
          style={{ borderColor: palette.panelBorder, background: palette.footerBg }}
        >
          <div
            className="flex items-end gap-2 rounded-2xl border px-3 py-2 transition-shadow focus-within:shadow-[0_0_0_3px_var(--chat-ring)]"
            style={{ background: palette.inputBg, borderColor: palette.inputBorder, ['--chat-ring' as string]: withAlpha(palette.primary, 0.35) }}
          >
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={isPending ? 'Waiting for the reply…' : 'Ask about this event…'}
              aria-label="Type your question"
              className="max-h-28 flex-1 resize-none bg-transparent py-1.5 text-[14px] outline-none placeholder:opacity-50"
              style={{ color: palette.text }}
            />
            <motion.button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              whileHover={canSend ? { scale: 1.08 } : undefined}
              whileTap={canSend ? { scale: 0.9, rotate: -8 } : undefined}
              animate={{ opacity: canSend ? 1 : 0.45 }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl disabled:cursor-not-allowed"
              style={{ background: palette.gradient, color: palette.onGradient }}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </motion.button>
          </div>
          <p className="mt-2 text-center text-[10px]" style={{ color: palette.muted }}>
            Powered by EventSphere AI · Answers may not always be accurate
          </p>
        </div>
  );
}