import {
  Building2,
  CalendarCheck,
  CalendarDays,
  Compass,
  LayoutDashboard,
  Megaphone,
  ReceiptText,
  ScanLine,
  Ticket,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type NavSubItem = { name: string; path: string };

export type NavItem = {
  name: string;
  icon: LucideIcon;
  path?: string;
  subItems?: NavSubItem[];
};

export type NavSections = { main: NavItem[]; others: NavItem[] };

// =======================
// ORGANIZER MENUS
// =======================
const organizerNav: NavSections = {
  main: [
    { icon: LayoutDashboard, name: "Dashboard", path: "/dashboard" },
    { icon: Building2, name: "My Organization", path: "/workspaces" },
    { icon: CalendarDays, name: "Events Oversight", path: "/events" },
    { icon: ReceiptText, name: "Orders", path: "/orders" },
    { icon: Ticket, name: "Tickets", path: "/tickets" },
    { icon: ScanLine, name: "Check-In", path: "/check-in" },
    { icon: TrendingUp, name: "Demand Forecast", path: "/demand-forecast" },
  ],
  others: [
    { icon: Megaphone, name: "Announcement", path: "/email" },
    { icon: UserRound, name: "My Profile", path: "/profile" },
  ],
};

// =======================
// ATTENDEE MENUS
// =======================
const attendeeNav: NavSections = {
  main: [
    { icon: Compass, name: "Browse Events", path: "/attendee/explore" },
    { icon: Ticket, name: "My Tickets", path: "/attendee/tickets" },
    { icon: ReceiptText, name: "My Orders", path: "/attendee/orders" },
    { icon: CalendarCheck, name: "My Events", path: "/attendee/events" },
  ],
  others: [{ icon: UserRound, name: "My Profile", path: "/profile" }],
};

export const getNavSections = (role: string | null): NavSections =>
  role === "ORGANIZER" ? organizerNav : attendeeNav;

/** "/events" is active for "/events" and "/events/create", but not "/events-old". */
export const isPathActive = (pathname: string, path: string): boolean =>
  pathname === path || pathname.startsWith(`${path}/`);
