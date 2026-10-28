'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { publicService, ChatJobFailedError, ChatTimeoutError } from '@/api/publicService';
import { loadChat, saveChat, clearChat } from '@/utils/chatSession';
import { CHAT_FAILED_MESSAGE, buildChatWhatsAppMessage, buildWhatsAppLink } from '@/utils/chatHelpers';

import { CHAT_FAILED_NO_WHATSAPP_MESSAGE, CHAT_IRRELEVANT_FALLBACK } from './chatConstants';
import { ChatMsg } from './types';

interface UseEventChatOptions {
  eventId: string;
  eventTitle: string;
  organizerPhone?: string;
}

export function useEventChat({ eventId, eventTitle, organizerPhone }: UseEventChatOptions) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [hydrated, setHydrated] = useState(false); // saved chat has been loaded

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

  // ── cancel any running request when the page is closed ──
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // ── stop typing animations and WhatsApp auto-open (called when the panel closes) ──
  const settleMessages = useCallback(() => {
    setMessages((prev) => prev.map((m) => ({ ...m, animate: false, autoOpen: false })));
  }, []);

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

  return {
    messages,
    input,
    setInput,
    isPending,
    send,
    handleRetry,
    startNewChat,
    handleTypingDone,
    handleHandoffFinished,
    settleMessages,
  };
}