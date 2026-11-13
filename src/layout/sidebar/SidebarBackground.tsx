"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Decorative dark-green background: gradient, soft moving glows and a dot grid. */
export default function SidebarBackground() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-brand-950 via-[#08201b] to-gray-950" />

      <motion.div
        className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl"
        animate={reduce ? undefined : { x: [0, 28, 0], y: [0, 22, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 bottom-16 h-60 w-60 rounded-full bg-brand-300/10 blur-3xl"
        animate={reduce ? undefined : { x: [0, -24, 0], y: [0, -18, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[22px_22px]" />
      <div className="absolute inset-y-0 right-0 w-px bg-linear-to-b from-transparent via-brand-300/30 to-transparent" />
    </div>
  );
}
