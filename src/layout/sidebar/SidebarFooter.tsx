"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded-md border border-white/15 bg-white/10 px-1.5 py-0.5 font-sans text-[10px] font-medium text-gray-200">
    {children}
  </kbd>
);

/** Small tip card. Hidden when the sidebar is collapsed and on touch screens. */
export default function SidebarFooter({ isOpen }: { isOpen: boolean }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      className="mx-4 mb-5 shrink-0 rounded-2xl border border-white/10 bg-white/4 p-3.5 backdrop-blur max-lg:hidden"
    >
      <div className="flex items-center gap-2 text-brand-200">
        <Sparkles className="size-4" />
        <span className="text-xs font-semibold">Quick tip</span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-gray-400">
        Press <Kbd>Ctrl</Kbd> <Kbd>K</Kbd> (<Kbd>⌘</Kbd> <Kbd>K</Kbd> on Mac) to jump to any page or action.
      </p>
    </motion.div>
  );
}
