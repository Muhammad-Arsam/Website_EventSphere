'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { publicService, ChatJobFailedError, ChatTimeoutError } from '@/api/publicService';
import { getStoredSessionId, getOrCreateSessionId, touchSession, clearChat } from '@/utils/chatSession';
import { CHAT_FAILED_MESSAGE, buildChatWhatsAppMessage, buildWhatsAppLink } from '@/utils/chatHelpers';

import { CHAT_FAILED_NO_WHATSAPP_MESSAGE, CHAT_IRRELEVANT_FALLBACK } from './chatConstants';
import { ChatMsg } from './types';
import { historyToMessages } from './historyMapper';

export type HistoryStatus = 'idle' | 'loading' | 'ready' | 'error';

interface UseEventChatOptions {
  eventId: string;
  eventTitle: string;
  organizerPhone?: string;
}

// All chat logic: messages, chat history from the server, session id, sending a question, polling result,
// failure / irrelevant handling (WhatsApp handoff), retry and "New chat".
// It has no screen code, so it can be read and tested on its own.
export function useEventChat({ eventId, eventTitle, organizerPhone }: UseEventChatOptions) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [historyStatus, setHistoryStatus] = useState<HistoryStatus>('idle');

  const abortRef = useRef<AbortController | null>(null); // running question
  const historyAbortRef = useRef<AbortController | null>(null); // running history request
  const historyDoneRef = useRef(false); // true once the history is loaded (or there is nothing to load)
  const sessionIdRef = useRef('');
  const idCounter = useRef(0);

  const nextId = () => `m-${Date.now()}-${idCounter.current++}`;

  // ── cancel running requests when the page is closed ──
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      historyAbortRef.current?.abort();
    };
  }, []);

  // ── load the previous messages of this visitor (called when the chat is opened) ──
  // Only visitors who chatted before have a saved session id. For everyone else nothing is requested.
  const loadHistory = useCallback(async () => {
    if (historyDoneRef.current || historyAbortRef.current) return; // already loaded, or loading right now

    const sessionId = getStoredSessionId(eventId);
    if (!sessionId) {
      historyDoneRef.current = true;
      setHistoryStatus('ready');
      return;
    }

    sessionIdRef.current = sessionId;
    const controller = new AbortController();
    historyAbortRef.current = controller;
    setHistoryStatus('loading');

    try {
      const items = await publicService.getChatHistory(sessionId, controller.signal);
      if (controller.signal.aborted) return;
      setMessages((prev) => (prev.length ? prev : historyToMessages(items)));
      touchSession(eventId);
      historyDoneRef.current = true;
      setHistoryStatus('ready');
    } catch {
      if (controller.signal.aborted) return;
      setHistoryStatus('error'); // the visitor can try again, or just start chatting
    } finally {
      if (historyAbortRef.current === controller) historyAbortRef.current = null;
    }
  }, [eventId]);

  // ── stop typing animations and WhatsApp auto-open (called when the panel closes) ──
  const settleMessages = useCallback(() => {
    setMessages((prev) => prev.map((m) => ({ ...m, animate: false, autoOpen: false })));
  }, []);

  // ── new chat: stop running requests, forget the session. The next question starts a new session ──
  const startNewChat = () => {
    abortRef.current?.abort();
    historyAbortRef.current?.abort();
    historyAbortRef.current = null;
    historyDoneRef.current = true; // nothing to load for a new session
    setHistoryStatus('ready');
    setIsPending(false);
    clearChat(eventId);
    sessionIdRef.current = '';
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
      if (!text || isPending || historyStatus === 'loading') return;

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
        // Created with the first question and saved in the browser; the same value is sent with every message.
        if (sessionIdRef.current) touchSession(eventId);
        else sessionIdRef.current = getOrCreateSessionId(eventId);

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
    [eventId, eventTitle, historyStatus, isPending, organizerPhone],
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
    historyStatus,
    loadHistory,
    send,
    handleRetry,
    startNewChat,
    handleTypingDone,
    handleHandoffFinished,
    settleMessages,
  };
}