"use client";

import React from "react";
import { cn } from "@/utils/cn";
import SidebarBackground from "./SidebarBackground";

type Props = {
  isOpen: boolean;
  isMobileOpen: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  children: React.ReactNode;
};

/** The fixed <aside>: width, mobile slide-in, background. Used by the real sidebar and the skeleton. */
export default function SidebarShell({
  isOpen,
  isMobileOpen,
  onMouseEnter,
  onMouseLeave,
  children,
}: Props) {
  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "fixed left-0 top-0 z-50 h-screen overflow-hidden border-r border-white/5 bg-gray-950 text-white",
        "transition-[width,transform] duration-300 ease-in-out max-lg:z-999999",
        isOpen ? "w-[290px]" : "w-[90px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}
    >
      <SidebarBackground />
      <div className="relative z-10 flex h-full min-h-0 flex-col">{children}</div>
    </aside>
  );
}
