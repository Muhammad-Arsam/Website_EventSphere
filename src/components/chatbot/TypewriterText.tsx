'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import MarkdownText from './MarkdownText';
import { countVisibleChars, parseMarkdown, sliceBlocks } from './markdown';

interface TypewriterTextProps {
  text: string; // Markdown text from the AI
  animate: boolean; // false = show the full text immediately
  caretColor?: string;
  onProgress?: () => void; // called on every step (used to keep the chat scrolled down)
  onDone?: () => void;
}

// Shows the AI reply as formatted text (bold, lists, links...) and reveals it smoothly.
// The Markdown is parsed first and then revealed, so symbols like ** are never shown on screen.
// Total time is 0.5s to 2.2s, depending on text length.
export default function TypewriterText({ text, animate, caretColor, onProgress, onDone }: TypewriterTextProps) {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animate && !reduceMotion;

  const blocks = useMemo(() => parseMarkdown(text), [text]);
  const total = useMemo(() => countVisibleChars(blocks), [blocks]);

  const [count, setCount] = useState(0);
  // when not animating, the full text is shown (no state to keep in sync)
  const shown = shouldAnimate ? Math.min(count, total) : total;

  // keep the latest callbacks without restarting the animation
  const progressRef = useRef(onProgress);
  const doneRef = useRef(onDone);
  useEffect(() => {
    progressRef.current = onProgress;
    doneRef.current = onDone;
  });

  useEffect(() => {
    if (!shouldAnimate) {
      if (animate) doneRef.current?.(); // reduced motion: finish at once
      return;
    }

    const duration = Math.min(2200, Math.max(500, total * 16));
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setCount(Math.floor(p * total));
      progressRef.current?.();
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setCount(total);
        doneRef.current?.();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total, shouldAnimate, animate]);

  const typing = shown < total;
  const visible = useMemo(() => (typing ? sliceBlocks(blocks, shown) : blocks), [typing, blocks, shown]);

  const caret = typing ? (
    <motion.span
      aria-hidden
      className="inline-block w-0.5 h-[1em] align-[-0.12em] ml-0.5 rounded-full"
      style={{ background: caretColor || 'currentColor' }}
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
    />
  ) : null;

  return <MarkdownText blocks={visible} tail={caret} />;
}