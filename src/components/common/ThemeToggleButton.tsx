"use client";

import React from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Light mode shows the moon (switch to dark), dark mode shows the sun.
 * The swap is pure CSS (dark: classes), so there is no flash or hydration mismatch.
 */
export const ThemeToggleButton: React.FC = () => {
  const { toggleTheme } = useTheme();

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/5 text-gray-200 backdrop-blur transition-colors hover:border-brand-300/40 hover:bg-white/10 hover:text-white"
    >
      <Moon className="absolute size-5 rotate-0 scale-100 transition-all duration-500 dark:rotate-90 dark:scale-0" />
      <Sun className="absolute size-5 -rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
    </motion.button>
  );
};
