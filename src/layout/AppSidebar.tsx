"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { getRole } from "@/utils/token";
import { organizationService } from "@/api/organizationService";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  UserCircleIcon,
} from "../icons";
import { Mail, Tickets, Loader2, ScanLine } from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// =======================
// ORGANIZER MENUS
// =======================
const organizerNavItems: NavItem[] = [
  { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },
  { icon: <BoxCubeIcon />, name: "My Organization", path: "/workspaces" },
  { icon: <CalenderIcon />, name: "Events Oversight", path: "/events" },
  { icon: <ListIcon />, name: "Orders", path: "/orders" },
  { icon: <Tickets />, name: "Tickets", path: "/tickets" },
  { icon: <ScanLine />, name: "Check-In", path: "/check-in" },
];

const organizerOthersItems: NavItem[] = [
  { icon: <Mail />, name: "Announcement", path: "/email" },
  { icon: <UserCircleIcon />, name: "My Profile", path: "/profile" },
];

// =======================
// ATTENDEE MENUS
// =======================
const attendeeNavItems: NavItem[] = [
  { icon: <CalenderIcon />, name: "Browse Events", path: "/attendee/explore" },
  { icon: <Tickets />, name: "My Tickets", path: "/attendee/tickets" },
  { icon: <ListIcon />, name: "My Orders", path: "/attendee/orders" },
  { icon: <CalenderIcon />, name: "My Events", path: "/attendee/events" },
];

const attendeeOthersItems: NavItem[] = [
  { icon: <UserCircleIcon />, name: "My Profile", path: "/profile" },
];

// =======================
// COMPONENT
// =======================
const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 👇 Start as null (consistent on server & client)
  const [userRole, setUserRole] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);

  // Read role only on client after mount
  useEffect(() => {
    const role = getRole() || "ATTENDEE";
    setUserRole(role);
  }, []);

  // Fetch organization logo when role becomes ORGANIZER
  useEffect(() => {
    if (userRole === "ORGANIZER") {
      setLogoLoading(true);
      const fetchOrganizationData = async () => {
        try {
          const orgData = await organizationService.getMyOrganization();
          if (orgData?.imageUrl) setImageUrl(orgData.imageUrl);
        } catch (error) {
          console.error("Failed to fetch organization details:", error);
        } finally {
          setLogoLoading(false);
        }
      };
      fetchOrganizationData();
    }
  }, [userRole]);

  const currentNavItems = userRole === "ORGANIZER" ? organizerNavItems : attendeeNavItems;
  const currentOthersItems = userRole === "ORGANIZER" ? organizerOthersItems : attendeeOthersItems;

  const isActive = useCallback(
    (path: string) => pathname.startsWith(path),
    [pathname]
  );

  // Auto-open submenu (only when role known)
  useEffect(() => {
    if (!userRole) return;
    let submenuMatched = false;
    const menuGroups = [
      { type: "main", items: currentNavItems },
      { type: "others", items: currentOthersItems },
    ];
    menuGroups.forEach(({ type, items }) => {
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: type as "main" | "others", index });
              submenuMatched = true;
            }
          });
        }
      });
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [pathname, isActive, userRole, currentNavItems, currentOthersItems]);

  // Submenu height calculation
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, type: "main" | "others") => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === type && prev.index === index) return null;
      return { type, index };
    });
  };

  const renderMenuItems = (items: NavItem[], type: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={`${type}-${index}`}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, type)}
              className={`menu-item group ${openSubmenu?.type === type && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } ${!isExpanded && !isHovered ? "lg:justify-center" : ""}`}
            >
              <span className="menu-item-icon-size">{nav.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto transition-transform ${openSubmenu?.type === type && openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span className="menu-item-icon-size">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${type}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === type && openSubmenu?.index === index
                    ? `${subMenuHeight[`${type}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="ml-9 mt-2 space-y-1">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.path}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  // Loading skeleton (rendered on both server and client until role is known)
  if (!userRole) {
    const isSidebarOpenLoading = isExpanded || isHovered || isMobileOpen;
    return (
      <aside
        className={`fixed top-0 left-0 h-screen px-5 border-r transition-all duration-300 bg-white dark:bg-gray-900 ${isSidebarOpenLoading ? "w-[290px]" : "w-[90px]"
          }`}
      >
        <div className="py-8 flex justify-center">
          <Loader2 className="animate-spin text-brand-500 h-8 w-8" />
        </div>
        <div className="space-y-6 px-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </aside>
    );
  }

  const isSidebarOpen = isExpanded || isHovered || isMobileOpen;

  return (
    <>
      {/* Backdrop overlay – only on mobile when sidebar is open */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen px-5 border-r transition-all duration-300 bg-white dark:bg-gray-900 z-50
      ${isSidebarOpen ? "w-[290px]" : "w-[90px]"}
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* LOGO */}
        <div className="pt-40 pb-8 md:py-8 flex justify-center">
          <div className="flex items-center justify-center w-full overflow-hidden">
            {userRole === "ORGANIZER" && logoLoading ? (
              <Loader2
                className={`animate-spin text-brand-500 transition-all duration-300 ${isSidebarOpen || isMobileOpen ? "h-10 w-10" : "h-6 w-6"
                  }`}
              />
            ) : userRole === "ORGANIZER" && imageUrl ? (
              <img
                src={imageUrl}
                alt="Organization Logo"
                className={`object-contain transition-all duration-300 ${isSidebarOpen || isMobileOpen
                  ? "max-h-[80px] w-auto"
                  : "max-h-[40px] w-[40px] rounded-full"
                  }`}
                style={{
                  maxWidth: isSidebarOpen || isMobileOpen ? "180px" : "40px",
                  height: "auto",
                }}
              />
            ) : isSidebarOpen || isMobileOpen ? (
              <Image
                src="/images/logo/eventsphere-logo.png"
                alt="Eventsphere"
                width={160}
                height={40}
                className="object-contain h-auto w-auto max-h-10"
                priority
              />
            ) : (
              <Image
                src="/images/logo/eventsphere-icon.png"
                alt="Eventsphere Icon"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            )}
          </div>
        </div>

        {/* MENU */}
        <nav className="space-y-6">
          <div>
            <h2 className="text-xs text-gray-400 mb-4">
              {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
            </h2>
            {renderMenuItems(currentNavItems, "main")}
          </div>
          <div>
            <h2 className="text-xs text-gray-400 mb-4">
              {isExpanded || isHovered || isMobileOpen ? "System & Settings" : <HorizontaLDots />}
            </h2>
            {renderMenuItems(currentOthersItems, "others")}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default AppSidebar;