"use client";

import { Command } from "cmdk";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  hint?: string;
  keywords?: string[];
  onSelect: () => void;
};

export default function PaletteItem({ icon: Icon, label, hint, keywords, onSelect }: Props) {
  return (
    <Command.Item
      value={label}
      keywords={keywords}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors data-[selected=true]:bg-brand-50 data-[selected=true]:text-brand-700 dark:text-gray-200 dark:data-[selected=true]:bg-brand-500/15 dark:data-[selected=true]:text-brand-200"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gray-100 text-gray-500 dark:bg-white/8 dark:text-gray-400">
        <Icon className="size-4" />
      </span>
      <span className="flex-1 truncate">{label}</span>
      {hint && <span className="text-xs font-normal text-gray-400">{hint}</span>}
    </Command.Item>
  );
}
