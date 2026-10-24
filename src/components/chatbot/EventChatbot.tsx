'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Bot, Hand, RotateCcw, Send, SquarePen, Sparkles, X } from 'lucide-react';

import { publicService, ChatJobFailedError, ChatTimeoutError } from '@/api/publicService';
import { loadChat, saveChat, clearChat } from '@/utils/chatSession';
import { StoredChatMessage } from '@/types/chat.types';
import { CHAT_FAILED_MESSAGE, buildChatWhatsAppMessage, buildWhatsAppLink } from '@/utils/chatHelpers';

import { FONT_MAP, buildChatPalette, withAlpha, ChatPalette } from './chatTheme';
import TypingIndicator, { BotAvatar } from './TypingIndicator';
import TypewriterText from './TypewriterText';
import WhatsAppHandoff from './WhatsAppHandoff';

// Shown instead of CHAT_FAILED_MESSAGE when the organizer has no valid phone number
// (CHAT_FAILED_MESSAGE promises a WhatsApp connection, so it would be misleading).
const CHAT_FAILED_NO_WHATSAPP_MESSAGE =
  "Sorry, something went wrong on our side and we couldn't answer your question. Please try again in a moment.";

// Used if the backend returns IRRELEVANT with an empty answer.
const CHAT_IRRELEVANT_FALLBACK = "Sorry, I couldn't help with that one.";

const MAX_MESSAGE_LENGTH = 500; // frontend limit only, change if you like

const SUGGESTIONS = [
  'What time does the event start?',
  'Where is the venue?',
  'What ticket options are available?',
  'What is the refund policy?',
];

// StoredChatMessage (id, role, text, kind, time, handoffLink) is what gets saved in the browser.
// The fields below only live while the page is open.
interface ChatMsg extends StoredChatMessage {
  animate?: boolean; // typewriter effect for fresh bot messages
  retryText?: string; // set on error bubbles that can be retried (not saved)
  autoOpen?: boolean; // open WhatsApp automatically after a short countdown
}

export interface EventChatbotProps {
  eventId: string; // the event's UUID (used by the chat API and for saving the chat history)
  eventTitle: string;
  eventImageUrl?: string;
  organizerPhone?: string;
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor?: string;
  fontStyle?: string;
}

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

function MessageBubble({ msg, palette, onProgress, onTypingDone, onHandoffFinished, onRetry }: MessageBubbleProps) {
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

// ─── The widget ───────────────────────────────────────────────────────────────
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
  const [showHint, setShowHint] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [hydrated, setHydrated] = useState(false); // saved chat has been loaded

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef('');
  const idCounter = useRef(0);

  const nextId = () => `m-${Date.now()}-${idCounter.current++}`;

  // ── load the saved chat (session_id + history) for this event ──
  useEffect(() => {
    const saved = loadChat(eventId);
    sessionIdRef.current = saved.sessionId;
    setMessages(saved.messages.map((m) => ({ ...m, animate: false, autoOpen: false })));
    setHydrated(true);
  }, [eventId]);

  // ── save the chat whenever it changes (only after loading, so we never overwrite it with an empty list) ──
  useEffect(() => {
    if (!hydrated) return;
    saveChat(
      eventId,
      sessionIdRef.current,
      messages.filter((m) => !m.retryText), // temporary "try again" errors are not history
    );
  }, [messages, hydrated, eventId]);

  // ── scrolling ──
  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
  }, [reduceMotion]);

  const keepBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isPending, scrollToBottom]);

  // ── textarea auto height ──
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [input, open]);

  // ── when the panel opens: show the latest message and focus the input ──
  useEffect(() => {
    if (!open) return;
    const jump = setTimeout(() => scrollToBottom(false), 60);
    const focus = setTimeout(() => inputRef.current?.focus(), 350);
    return () => {
      clearTimeout(jump);
      clearTimeout(focus);
    };
  }, [open, scrollToBottom]);

  // ── hint bubble next to the launcher ──
  useEffect(() => {
    if (open) {
      setShowHint(false);
      return;
    }
    const show = setTimeout(() => setShowHint(true), 3500);
    const hide = setTimeout(() => setShowHint(false), 12000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [open]);

  // ── Esc closes, and lock page scroll when the panel is full screen (mobile) ──
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);

    const isMobile = window.matchMedia('(max-width: 639px)').matches;
    const previousOverflow = document.body.style.overflow;
    if (isMobile) document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // ── cancel any running request when the page is closed ──
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // ── open / close ──
  const closePanel = () => {
    setOpen(false);
    // do not replay typing or auto-open WhatsApp when the panel is opened again
    setMessages((prev) => prev.map((m) => ({ ...m, animate: false, autoOpen: false })));
  };

  const togglePanel = () => (open ? closePanel() : setOpen(true));

  // ── new chat: stop any running request, forget the history, start a new session ──
  const startNewChat = () => {
    abortRef.current?.abort();
    setIsPending(false);
    clearChat(eventId);
    sessionIdRef.current = loadChat(eventId).sessionId; // creates and saves a fresh session_id
    setMessages([]);
    setInput('');
  };

  // ── message helpers ──
  const handleTypingDone = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id && m.animate ? { ...m, animate: false } : m)));
  }, []);

  const handleHandoffFinished = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id && m.autoOpen ? { ...m, autoOpen: false } : m)));
  }, []);

  // ── send a question ──
  const send = useCallback(
    async (rawText: string, isRetry = false) => {
      const text = rawText.trim();
      if (!text || isPending) return;

      setInput('');
      if (!isRetry) {
        setMessages((prev) => [...prev, { id: nextId(), role: 'user', text, time: Date.now() }]);
      }
      setIsPending(true);

      const controller = new AbortController();
      abortRef.current = controller;

      // Failed job or timeout: show the hardcoded error, then hand over to WhatsApp
      const showFailure = () => {
        const link = buildWhatsAppLink(organizerPhone, buildChatWhatsAppMessage(eventTitle, text));
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'bot',
            kind: 'error',
            text: link ? CHAT_FAILED_MESSAGE : CHAT_FAILED_NO_WHATSAPP_MESSAGE,
            time: Date.now(),
            animate: true,
            handoffLink: link ?? undefined,
            autoOpen: !!link,
          },
        ]);
      };

      try {
        // Created once per event and saved in the browser; the same value is sent with every message.
        if (!sessionIdRef.current) sessionIdRef.current = loadChat(eventId).sessionId;

        const { job_id } = await publicService.sendChatMessage(
          eventId,
          { message: text, session_id: sessionIdRef.current },
          controller.signal,
        );
        if (!job_id) throw new Error('The assistant did not return a job id.');

        const result = await publicService.waitForChatAnswer(job_id, { signal: controller.signal });

        if (result.status === 'IRRELEVANT') {
          // The AI writes the message. We only add the WhatsApp handoff after it.
          const link = buildWhatsAppLink(organizerPhone, buildChatWhatsAppMessage(eventTitle, text));
          setMessages((prev) => [
            ...prev,
            {
              id: nextId(),
              role: 'bot',
              text: result.answer || CHAT_IRRELEVANT_FALLBACK,
              time: Date.now(),
              animate: true,
              handoffLink: link ?? undefined,
              autoOpen: !!link,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: nextId(),
              role: 'bot',
              text: result.answer || 'Sorry, I do not have an answer for that.',
              time: Date.now(),
              animate: true,
            },
          ]);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        if (err instanceof ChatJobFailedError || err instanceof ChatTimeoutError) {
          showFailure();
        } else {
          // Network or request error: let the user retry
          setMessages((prev) => [
            ...prev,
            {
              id: nextId(),
              role: 'bot',
              kind: 'error',
              text: err instanceof Error && err.message ? err.message : 'Something went wrong. Please try again.',
              time: Date.now(),
              animate: true,
              retryText: text,
            },
          ]);
        }
      } finally {
        if (!controller.signal.aborted) setIsPending(false);
      }
    },
    [eventId, eventTitle, isPending, organizerPhone],
  );

  const handleRetry = (msg: ChatMsg) => {
    if (!msg.retryText || isPending) return;
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    send(msg.retryText, true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  };

  const canSend = input.trim().length > 0 && !isPending;
  const showWelcome = messages.length === 0 && !isPending;

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
            {/* Header */}
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
                  {messages.length > 0 && (
                    <motion.button
                      key="new-chat"
                      type="button"
                      onClick={startNewChat}
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
                  onClick={closePanel}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            {/* Messages */}
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
              <AnimatePresence>
                {showWelcome && (
                  <motion.div
                    key="welcome"
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
                          onClick={() => send(q)}
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
                )}
              </AnimatePresence>

              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  palette={palette}
                  onProgress={keepBottom}
                  onTypingDone={handleTypingDone}
                  onHandoffFinished={handleHandoffFinished}
                  onRetry={handleRetry}
                />
              ))}

              <AnimatePresence>{isPending && <TypingIndicator key="typing" palette={palette} />}</AnimatePresence>
            </div>
            </div>

            {/* Input */}
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
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder={isPending ? 'Waiting for the reply…' : 'Ask about this event…'}
                  aria-label="Type your question"
                  className="max-h-28 flex-1 resize-none bg-transparent py-1.5 text-[14px] outline-none placeholder:opacity-50"
                  style={{ color: palette.text }}
                />
                <motion.button
                  type="button"
                  onClick={() => send(input)}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Launcher ── */}
      <div className="fixed bottom-24 right-4 z-9000 flex items-center gap-3 sm:bottom-6 sm:right-6">
        <AnimatePresence>
          {showHint && !open && (
            <motion.button
              key="hint"
              type="button"
              onClick={() => setOpen(true)}
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
            onClick={togglePanel}
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
    </div>
  );
}