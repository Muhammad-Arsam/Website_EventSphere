"use client";

import React, { useCallback, useMemo } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { useUserRole } from "@/hooks/useUserRole";
import { getNavSections } from "./sidebar/navConfig";
import { useOrganizationBrand } from "./sidebar/useOrganizationBrand";
import SidebarShell from "./sidebar/SidebarShell";
import SidebarBrand from "./sidebar/SidebarBrand";
import SidebarSection from "./sidebar/SidebarSection";
import SidebarFooter from "./sidebar/SidebarFooter";
import SidebarSkeleton from "./sidebar/SidebarSkeleton";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const { role, isReady } = useUserRole();

  const userRole = role || "ATTENDEE";
  const isOrganizer = userRole === "ORGANIZER";
  const brand = useOrganizationBrand(isReady && isOrganizer);
  const sections = useMemo(() => getNavSections(userRole), [userRole]);

  const isOpen = isExpanded || isHovered || isMobileOpen;

  // Close the mobile drawer after the user picks a page.
  const closeOnMobile = useCallback(() => {
    if (isMobileOpen) toggleMobileSidebar();
  }, [isMobileOpen, toggleMobileSidebar]);

  if (!isReady) return <SidebarSkeleton isOpen={isOpen} />;

  return (
      <SidebarShell
        isOpen={isOpen}
        isMobileOpen={isMobileOpen}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SidebarBrand
          isOpen={isOpen}
          isOrganizer={isOrganizer}
          logoUrl={brand.logoUrl}
          name={brand.name}
          isLoading={brand.isLoading}
          onClose={toggleMobileSidebar}
        />

        <nav className="no-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pb-6 pt-2">
          <SidebarSection
            title="Menu"
            items={sections.main}
            isOpen={isOpen}
            onNavigate={closeOnMobile}
          />
          <SidebarSection
            title="System & Settings"
            items={sections.others}
            isOpen={isOpen}
            startIndex={sections.main.length}
            onNavigate={closeOnMobile}
          />
        </nav>

        {/* <SidebarFooter isOpen={isOpen} /> */}
      </SidebarShell>
  );
};

export default AppSidebar;
