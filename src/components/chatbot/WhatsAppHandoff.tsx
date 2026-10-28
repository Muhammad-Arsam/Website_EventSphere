'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa6';

const COUNTDOWN_SECONDS = 4;

interface WhatsAppHandoffProps {
  link: string;
  autoOpen: boolean; // true only for a fresh handoff (not after the panel is reopened)
  onFinished: () => void; // tells the parent this handoff must not auto-open again
  muted: string;
  borderColor: string;
}

type HandoffState = 'counting' | 'opened' | 'blocked' | 'cancelled' | 'idle';

export default function WhatsAppHandoff({ link, autoOpen, onFinished, muted, borderColor }: WhatsAppHandoffProps) {
  const [state, setState] = useState<HandoffState>(autoOpen ? 'counting' : 'idle');
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const firedRef = useRef(false);
  const finishedRef = useRef(onFinished);
  useEffect(() => {
    finishedRef.current = onFinished;
  });

  useEffect(() => {
    if (state !== 'counting') return;

    const timer = setTimeout(() => {
      if (seconds > 1) {
        setSeconds(seconds - 1);
        return;
      }

      // countdown finished: open WhatsApp (only once)
      if (firedRef.current) return;
      firedRef.current = true;
      // Do not use the "noopener" feature here: it makes window.open() always return null,
      // so we could not tell if the browser blocked the new tab.
      const win = window.open(link, '_blank');
      if (win) {
        try {
          win.opener = null;
        } catch {
          /* ignore */
        }
        setState('opened');
      } else {
        setState('blocked');
      }
      finishedRef.current();
    }, 1000);

    return () => clearTimeout(timer);
  }, [state, seconds, link]);

  const handleCancel = () => {
    setState('cancelled');
    finishedRef.current();
  };

  const handleClick = () => {
    firedRef.current = true;
    setState('opened');
    finishedRef.current();
  };

  const statusText =
    state === 'counting'
      ? `Opening WhatsApp in ${seconds}s…`
      : state === 'opened'
        ? 'WhatsApp opened in a new tab.'
        : state === 'blocked'
          ? 'Your browser blocked the new tab. Tap the button to continue.'
          : 'Message the organizer directly.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26, delay: 0.15 }}
      className="mt-2 ml-9 rounded-2xl border p-3"
      style={{ borderColor }}
    >
      <div className="flex items-center gap-3">
        {state === 'counting' ? (
          <svg width="30" height="30" viewBox="0 0 30 30" className="shrink-0 -rotate-90" aria-hidden>
            <circle cx="15" cy="15" r="12" fill="none" stroke={borderColor} strokeWidth="3" />
            <motion.circle
              cx="15"
              cy="15"
              r="12"
              fill="none"
              stroke="#25D366"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: COUNTDOWN_SECONDS, ease: 'linear' }}
            />
          </svg>
        ) : (
          <span className="shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center" style={{ background: '#25D366' }}>
            <FaWhatsapp className="w-4 h-4 text-white" />
          </span>
        )}
        <p className="text-xs flex-1" style={{ color: muted }} aria-live="polite">
          {statusText}
        </p>
        {state === 'counting' && (
          <button type="button" onClick={handleCancel} className="text-xs font-semibold underline underline-offset-2" style={{ color: muted }}>
            Cancel
          </button>
        )}
      </div>

      <motion.a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="mt-3 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg"
        style={{ background: '#25D366', boxShadow: '0 10px 24px -10px rgba(37,211,102,0.8)' }}
      >
        <FaWhatsapp className="w-4 h-4" />
        Continue on WhatsApp
      </motion.a>
    </motion.div>
  );
}