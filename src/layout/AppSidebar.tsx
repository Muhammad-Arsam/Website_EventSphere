"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
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

const navItems: NavItem[] = [
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

const othersItems: NavItem[] = [
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

  // ✅ FIXED ACTIVE CHECK (VERY IMPORTANT)
  const isActive = useCallback(
    (path: string) => pathname.startsWith(path),
    [pathname]
  );

  // =======================
  // AUTO OPEN SUBMENU
  // =======================
  useEffect(() => {
    let submenuMatched = false;

    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;

      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) setOpenSubmenu(null);
  }, [pathname, isActive]);

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
              className={`menu-item group ${
                openSubmenu?.type === type && openSubmenu?.index === index
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
                  className={`ml-auto transition-transform ${
                    openSubmenu?.type === type &&
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
                className={`menu-item ${
                  isActive(nav.path)
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
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
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

  // =======================
  // UI
  // =======================
  return (
    <aside
      className={`fixed top-0 left-0 h-screen px-5 border-r transition-all duration-300 bg-white dark:bg-gray-900 
      ${isExpanded || isMobileOpen ? "w-[290px]" : "w-[90px]"}
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* LOGO */}
      <div className="py-8 flex justify-center">
        <Link href="/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <Image src="/images/logo/eventsphere-logo.png" alt="logo" width={150} height={40} />
          ) : (
            <Image src="/images/logo/eventsphere-icon.png" alt="logo" width={32} height={32} />
          )}
        </Link>
      </div>

      {/* MENU */}
      <nav className="space-y-6">
        <div>
          <h2 className="text-xs text-gray-400 mb-4">
            {isExpanded || isHovered ? "Menu" : <HorizontaLDots />}
          </h2>
          {renderMenuItems(navItems, "main")}
        </div>

        <div>
          <h2 className="text-xs text-gray-400 mb-4">
            {isExpanded || isHovered ? "System & Settings" : <HorizontaLDots />}
          </h2>
          {renderMenuItems(othersItems, "others")}
        </div>
      </nav>
    </aside>
  );
};

export default AppSidebar;
