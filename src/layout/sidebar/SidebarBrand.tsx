"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

type Props = {
  isOpen: boolean;
  isOrganizer: boolean;
  logoUrl: string | null;
  name: string | null;
  isLoading: boolean;
  onClose: () => void;
};

export default function SidebarBrand({
  isOpen,
  isOrganizer,
  logoUrl,
  name,
  isLoading,
  onClose,
}: Props) {
  const title = isOrganizer && name ? name : "eventsphere";
  const caption = isOrganizer ? "Organizer workspace" : "Discover events";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-3 pb-5 pt-6",
        isOpen ? "px-5" : "justify-center px-0"
      )}
    >
      <motion.div
        whileHover={{ rotate: 6, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-linear-to-br from-brand-300 via-brand-500 to-brand-700 shadow-[0_8px_24px_-6px_rgba(47,160,132,0.7)] ring-1 ring-white/20"
      >
        {isOrganizer && isLoading ? (
          <span className="size-full animate-pulse bg-white/20" />
        ) : isOrganizer && logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Organization logo" className="size-full bg-white object-cover" />
        ) : (
          <Image
            src="/images/logo/eventsphere-mark-white.png"
            alt="EventSphere"
            width={30}
            height={30}
            priority
          />
        )}
      </motion.div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="brand-text"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="min-w-0 flex-1"
          >
            <p className="truncate text-xl font-semibold tracking-tight text-white">{title}</p>
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-brand-300/70">
              {caption}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="grid size-9 place-items-center rounded-xl text-gray-300 transition hover:bg-white/10 hover:text-white lg:hidden"
      >
        <X className="size-5" />
      </button>
    </div>
  );
}
