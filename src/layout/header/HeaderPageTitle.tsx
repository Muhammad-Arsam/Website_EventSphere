"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getNavSections, isPathActive } from "@/layout/sidebar/navConfig";

/** Desktop only: shows the current page name, taken from the sidebar menu. */
export default function HeaderPageTitle({ role }: { role: string | null }) {
  const pathname = usePathname();

  const title = useMemo(() => {
    const { main, others } = getNavSections(role);
    const match = [...main, ...others]
      .filter((i) => i.path && isPathActive(pathname, i.path))
      .sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))[0];
    return match?.name ?? "EventSphere";
  }, [pathname, role]);

  return (
    <div className="hidden min-w-0 border-l border-white/15 pl-5 lg:block">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-300">
        {role === "ORGANIZER" ? "Organizer" : "Attendee"}
      </p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="truncate text-base font-semibold leading-tight text-white"
        >
          {title}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
