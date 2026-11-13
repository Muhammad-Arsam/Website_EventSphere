"use client";

import { Ellipsis } from "lucide-react";
import { cn } from "@/utils/cn";

type Props = { isOpen: boolean; onClick: () => void };

/** Mobile only: shows / hides the second header row (search, theme, user). */
export default function HeaderMoreButton({ isOpen, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Toggle header menu"
      aria-expanded={isOpen}
      className={cn(
        "grid size-10 place-items-center rounded-xl text-gray-200 transition-colors hover:bg-white/10 lg:hidden",
        isOpen && "bg-white/10 text-brand-300"
      )}
    >
      <Ellipsis className={cn("size-6 transition-transform duration-300", isOpen && "rotate-90")} />
    </button>
  );
}
