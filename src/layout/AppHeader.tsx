"use client";

import React, { useState } from "react";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/utils/cn";
import CommandPalette from "./header/CommandPalette";
import HeaderCreateEvent from "./header/HeaderCreateEvent";
import HeaderMobileLogo from "./header/HeaderMobileLogo";
import HeaderMoreButton from "./header/HeaderMoreButton";
import HeaderPageTitle from "./header/HeaderPageTitle";
import HeaderSearchButton from "./header/HeaderSearchButton";
import HeaderToggleButton from "./header/HeaderToggleButton";

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { role } = useUserRole();

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPaletteOpen, setPaletteOpen] = useState(false);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const roleLabel =
    role === "ORGANIZER" ? "Organizer" : role === "ATTENDEE" ? "Attendee" : undefined;

  return (
    <>
      <header className="sticky top-0 z-99999 w-full overflow-hidden border-b border-white/5 bg-linear-to-r from-brand-950 via-[#0b2f28] to-brand-900">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 -top-16 h-40 w-64 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="absolute -bottom-16 right-10 h-40 w-72 rounded-full bg-brand-300/15 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[20px_20px]" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-brand-300/50 to-transparent" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between lg:px-6">
          {/* Row 1: sidebar toggle, logo (mobile) / page title (desktop) */}
          <div className="flex items-center justify-between gap-3 px-3 py-3 lg:justify-start lg:gap-4 lg:px-0 lg:py-3.5">
            <HeaderToggleButton isMobileOpen={isMobileOpen} onClick={handleToggle} />
            <HeaderMobileLogo />
            <HeaderMoreButton
              isOpen={isMobileMenuOpen}
              onClick={() => setMobileMenuOpen((v) => !v)}
            />
            <HeaderPageTitle role={role} />
          </div>

          {/* Row 2: search, create event, theme, user (collapsible on mobile) */}
          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-out lg:grid-rows-[1fr]",
              isMobileMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="min-h-0 overflow-hidden lg:overflow-visible">
              <div className="flex flex-col gap-3 px-4 pb-4 pt-1 lg:flex-row lg:items-center lg:justify-end lg:p-0">
                <HeaderSearchButton
                  onClick={() => setPaletteOpen(true)}
                  className="w-full lg:w-72 xl:w-96"
                />
                <div className="flex items-center justify-between gap-3">
                  {role === "ORGANIZER" ? <HeaderCreateEvent /> : <span />}
                  <div className="flex items-center gap-3">
                    <ThemeToggleButton />
                    <UserDropdown roleLabel={roleLabel} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <CommandPalette open={isPaletteOpen} onOpenChange={setPaletteOpen} role={role} />
    </>
  );
};

export default AppHeader;
