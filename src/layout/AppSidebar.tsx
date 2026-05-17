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
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";

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
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <BoxCubeIcon />,
    name: "My Organization",
    path: "/workspaces",
  },
  {
    icon: <CalenderIcon />,
    name: "Events Oversight",
    path: "/events",
  },
];

const organizerOthersItems: NavItem[] = [
  {
    icon: <TableIcon />,
    name: "Subscriptions",
    path: "/subscriptions",
  },
  {
    icon: <PlugInIcon />,
    name: "System Config",
    subItems: [
      { name: "Email Settings", path: "/settings/email" },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "My Profile",
    path: "/profile",
  },
];

// =======================
// ATTENDEE MENUS
// =======================
const attendeeNavItems: NavItem[] = [
  {
    icon: <CalenderIcon />,
    name: "Browse Events",
    path: "/attendee/events",
  },
  {
    icon: <ListIcon />,
    name: "My Tickets",
    path: "/attendee/tickets",
  },
];

const attendeeOthersItems: NavItem[] = [
  {
    icon: <UserCircleIcon />,
    name: "My Profile",
    path: "/profile",
  },
];

// =======================
// COMPONENT
// =======================

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [userRole, setUserRole] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null); // ✅ Aligned with Organization type

  useEffect(() => {
    const role = getRole() || "ATTENDEE";
    setUserRole(role);

    // ✅ Fetch organization data using your service if the user is an Organizer
    if (role === "ORGANIZER") {
      const fetchOrganizationData = async () => {
        try {
          const orgData = await organizationService.getMyOrganization();
          if (orgData?.imageUrl) {
            setImageUrl(orgData.imageUrl);
          }
        } catch (error) {
          console.error("Failed to fetch organization details:", error);
        }
      };

      fetchOrganizationData();
    }
  }, []);

  const currentNavItems = userRole === "ORGANIZER" ? organizerNavItems : attendeeNavItems;
  const currentOthersItems = userRole === "ORGANIZER" ? organizerOthersItems : attendeeOthersItems;

  const isActive = useCallback(
    (path: string) => pathname.startsWith(path),
    [pathname]
  );

  // =======================
  // AUTO OPEN SUBMENU
  // =======================
  useEffect(() => {
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
              setOpenSubmenu({
                type: type as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) setOpenSubmenu(null);
  }, [pathname, isActive, currentNavItems, currentOthersItems]);

  // =======================
  // HEIGHT CALCULATION
  // =======================
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

  // =======================
  // TOGGLE
  // =======================
  const handleSubmenuToggle = (index: number, type: "main" | "others") => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === type && prev.index === index) {
        return null;
      }
      return { type, index };
    });
  };

  // =======================
  // RENDER MENU
  // =======================
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
                  className={`ml-auto transition-transform ${openSubmenu?.type === type &&
                    openSubmenu?.index === index
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
                className={`menu-item ${isActive(nav.path)
                  ? "menu-item-active"
                  : "menu-item-inactive"
                  }`}
              >
                <span className="menu-item-icon-size">{nav.icon}</span>

                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {/* SUBMENU */}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${type}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === type &&
                    openSubmenu?.index === index
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

  // ✅ Prevent rendering until role is loaded to stop hydration mismatch / UI flashing
  if (!userRole) return null;

  const isSidebarOpen = isExpanded || isHovered || isMobileOpen;

  // =======================
  // UI
  // =======================
  return (
    <aside
      className={`fixed top-0 left-0 h-screen px-5 border-r transition-all duration-300 bg-white dark:bg-gray-900 
      ${isSidebarOpen ? "w-[290px]" : "w-[90px]"}
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* LOGO */}
      <div className="py-8 flex justify-center">
        <div className="flex items-center justify-center w-full">
          {userRole === "ORGANIZER" && imageUrl ? (
            <Image
              src={imageUrl}
              alt="Organization Logo"
              width={isSidebarOpen ? 180 : 40}
              height={isSidebarOpen ? 80 : 40}
              className={`object-contain transition-all duration-300 ${!isSidebarOpen ? "rounded-md" : ""}`}
              style={{
                maxHeight: isSidebarOpen ? '80px' : '40px',
                width: "auto"
              }}
            />
          ) : (
            isSidebarOpen ? (
              <Image
                src="/images/logo/eventsphere-logo.png"
                alt="logo"
                width={150}
                height={40}
                className="object-contain"
              />
            ) : (
              <Image
                src="/images/logo/eventsphere-icon.png"
                alt="logo"
                width={40}
                height={40}
                className="object-contain"
              />
            )
          )}
        </div>
      </div>

      {/* MENU */}
      <nav className="space-y-6">
        <div>
          <h2 className="text-xs text-gray-400 mb-4">
            {isExpanded || isHovered ? "Menu" : <HorizontaLDots />}
          </h2>
          {renderMenuItems(currentNavItems, "main")}
        </div>

        <div>
          <h2 className="text-xs text-gray-400 mb-4">
            {isExpanded || isHovered ? "System & Settings" : <HorizontaLDots />}
          </h2>
          {renderMenuItems(currentOthersItems, "others")}
        </div>
      </nav>
    </aside>
  );
};

export default AppSidebar;