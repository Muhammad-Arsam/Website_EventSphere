'use client';

import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { formatInt } from '../forecastHelpers';

interface Props {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}

// Counts up from 0 to `value`. Jumps straight to the value if the user prefers reduced motion.
export default function AnimatedNumber({ value, format = formatInt, duration = 1.1, className }: Props) {
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(reduceMotion ? value : 0);
  const text = useTransform(motionValue, (v) => format(v));

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration, ease: 'easeOut' });
    return () => controls.stop();
  }, [value, duration, reduceMotion, motionValue]);

  return <motion.span className={className}>{text}</motion.span>;
}
