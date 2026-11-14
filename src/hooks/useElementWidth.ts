"use client";

import { useEffect, useState } from "react";

/**
 * Measures the width of an element and keeps it up to date when the window
 * is resized or the phone is rotated.
 *
 * Use the returned `ref` as a callback ref: <div ref={ref}>.
 * It also works when the element appears later (for example after loading).
 */
export function useElementWidth<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return { ref: setElement, width };
}
