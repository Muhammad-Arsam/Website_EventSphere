"use client";

import { cn } from "@/utils/cn";
import SidebarItem from "./SidebarItem";
import type { NavItem } from "./navConfig";

type Props = {
  title: string;
  items: NavItem[];
  isOpen: boolean;
  startIndex?: number;
  onNavigate: () => void;
};

export default function SidebarSection({ title, items, isOpen, startIndex = 0, onNavigate }: Props) {
  return (
    <div>
      {isOpen ? (
        <h2 className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-300/60">
          {title}
        </h2>
      ) : (
        <div className="mx-auto mb-3 h-px w-8 bg-white/10" />
      )}
      <ul className={cn("flex flex-col gap-1.5")}>
        {items.map((item, i) => (
          <SidebarItem
            key={item.name}
            item={item}
            isOpen={isOpen}
            index={startIndex + i}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </div>
  );
}
