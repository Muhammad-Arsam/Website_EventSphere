"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSidebar } from "@/context/SidebarContext";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  return (
    <AnimatePresence>
      {isMobileOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={toggleMobileSidebar}
          aria-hidden
          className="fixed inset-0 z-999990 bg-brand-950/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </AnimatePresence>
  );
};

export default Backdrop;
