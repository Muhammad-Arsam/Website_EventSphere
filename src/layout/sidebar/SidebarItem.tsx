"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { isPathActive, type NavItem } from "./navConfig";

type Props = {
  item: NavItem;
  isOpen: boolean;
  index: number;
  onNavigate: () => void;
};

const baseClass =
  "group relative flex h-11 w-full items-center gap-3 rounded-xl text-[14px] font-medium transition-colors";

export default function SidebarItem({ item, isOpen, index, onNavigate }: Props) {
  const pathname = usePathname();
  const Icon = item.icon;

  const hasSub = !!item.subItems?.length;
  const isActive = item.path ? isPathActive(pathname, item.path) : false;
  const hasActiveChild = item.subItems?.some((s) => isPathActive(pathname, s.path)) ?? false;

  // null = follow the route (open when a child page is active); true/false = user clicked.
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
  const expanded = manualExpanded ?? hasActiveChild;

  const face = (
    <>
      {isActive && (
        <>
          <motion.span
            layoutId="sidebar-active-pill"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="absolute inset-0 rounded-xl bg-linear-to-r from-brand-500 to-brand-600 shadow-[0_10px_28px_-10px_rgba(47,160,132,0.9)] ring-1 ring-white/15"
          />
          <motion.span
            layoutId="sidebar-active-bar"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="absolute -left-4 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-300"
          />
        </>
      )}

      <Icon
        className={cn(
          "relative z-10 size-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
          isActive ? "text-white" : "text-brand-200/70 group-hover:text-brand-300"
        )}
      />

      {isOpen && (
        <span className="relative z-10 animate-label-in truncate transition-transform duration-300 group-hover:translate-x-0.5">
          {item.name}
        </span>
      )}

      {hasSub && isOpen && (
        <ChevronDown
          className={cn(
            "relative z-10 ml-auto size-4 text-gray-400 transition-transform duration-300",
            expanded && "rotate-180 text-brand-300"
          )}
        />
      )}
    </>
  );

  const stateClass = cn(
    isOpen ? "px-3" : "justify-center px-0",
    isActive
      ? "text-white"
      : cn(
          "text-gray-300/80 hover:bg-white/6 hover:text-white",
          hasActiveChild && "text-brand-200"
        )
  );

  return (
    <li
      className="animate-item-in"
      style={{ animationDelay: `${0.05 + index * 0.04}s` }}
    >
      {hasSub ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setManualExpanded(!expanded)}
          className={cn(baseClass, stateClass)}
        >
          {face}
        </button>
      ) : (
        item.path && (
          <Link
            href={item.path}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(baseClass, stateClass)}
          >
            {face}
          </Link>
        )
      )}

      <AnimatePresence initial={false}>
        {hasSub && isOpen && expanded && (
          <motion.ul
            key="sub"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="ml-5 mt-1 space-y-1 overflow-hidden border-l border-white/10 pl-4"
          >
            {item.subItems!.map((sub) => {
              const subActive = isPathActive(pathname, sub.path);
              return (
                <li key={sub.path}>
                  <Link
                    href={sub.path}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                      subActive
                        ? "bg-brand-500/15 text-brand-200"
                        : "text-gray-400 hover:bg-white/6 hover:text-white"
                    )}
                  >
                    {sub.name}
                  </Link>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}
