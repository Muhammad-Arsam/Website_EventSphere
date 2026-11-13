"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

type Props = { isMobileOpen: boolean; onClick: () => void };

export default function HeaderToggleButton({ isMobileOpen, onClick }: Props) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label="Toggle sidebar"
      className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/5 text-gray-200 backdrop-blur transition-colors hover:border-brand-300/40 hover:bg-white/10 hover:text-white lg:size-11"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isMobileOpen ? "close" : "open"}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.15 }}
          className="grid place-items-center"
        >
          {isMobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
