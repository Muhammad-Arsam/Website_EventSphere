"use client";

import { useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import { cn } from "@/utils/cn";

type Props = { onClick: () => void; className?: string };

const subscribe = () => () => {};

/** Opens the command palette. Shows ⌘K on Mac and Ctrl K elsewhere. */
export default function HeaderSearchButton({ onClick, className }: Props) {
  const isMac = useSyncExternalStore(
    subscribe,
    () => /Mac|iPhone|iPad/i.test(navigator.userAgent),
    () => false
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-gray-300 backdrop-blur transition-colors hover:border-brand-300/40 hover:bg-white/10",
        className
      )}
    >
      <Search className="size-[18px] shrink-0 transition-colors group-hover:text-brand-500" />
      <span className="flex-1 truncate text-left">Search pages &amp; actions…</span>
      <kbd className="hidden items-center gap-1 rounded-md border border-white/15 bg-white/10 px-1.5 py-0.5 font-sans text-[11px] font-medium text-gray-200 lg:inline-flex">
        {isMac ? "⌘ K" : "Ctrl K"}
      </kbd>
    </button>
  );
}
