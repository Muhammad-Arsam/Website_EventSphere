"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { LogOut, Moon, Plus, Search } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { authService } from "@/api/authService";
import { getNavSections } from "@/layout/sidebar/navConfig";
import PaletteItem from "./PaletteItem";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: string | null;
};

const groupClass =
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-gray-400";

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-sans text-[10px] font-medium text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
    {children}
  </kbd>
);

export default function CommandPalette({ open, onOpenChange, role }: Props) {
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const sections = useMemo(() => getNavSections(role), [role]);
  const pages = useMemo(
    () => [...sections.main, ...sections.others].filter((i) => i.path),
    [sections]
  );

  // Ctrl/⌘ + K opens and closes the palette.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  const run = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Search pages and actions"
      loop
      overlayClassName="fixed inset-0 z-999999 bg-gray-950/50 backdrop-blur-sm animate-fade-in"
      contentClassName="fixed inset-x-0 top-[12vh] z-999999 mx-auto w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xl animate-palette-in dark:border-white/10 dark:bg-gray-dark"
    >
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 dark:border-white/10">
        <Search className="size-5 shrink-0 text-gray-400" />
        <Command.Input
          placeholder="Search pages and actions…"
          className="h-14 w-full bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
        />
        <Kbd>Esc</Kbd>
      </div>

      <Command.List className="custom-scrollbar max-h-[min(60vh,380px)] overflow-y-auto p-2">
        <Command.Empty className="px-4 py-10 text-center text-sm text-gray-500">
          No results found.
        </Command.Empty>

        <Command.Group heading="Pages" className={groupClass}>
          {pages.map((page) => (
            <PaletteItem
              key={page.path}
              icon={page.icon}
              label={page.name}
              hint="Go to page"
              onSelect={() => run(() => router.push(page.path!))}
            />
          ))}
        </Command.Group>

        <Command.Group heading="Actions" className={groupClass}>
          {role === "ORGANIZER" && (
            <PaletteItem
              icon={Plus}
              label="Create event"
              keywords={["new", "add", "event"]}
              onSelect={() => run(() => router.push("/events/create"))}
            />
          )}
          <PaletteItem
            icon={Moon}
            label="Toggle dark mode"
            keywords={["theme", "light", "dark"]}
            onSelect={() => run(toggleTheme)}
          />
          <PaletteItem
            icon={LogOut}
            label="Sign out"
            keywords={["logout", "exit"]}
            onSelect={() => run(() => void authService.logout())}
          />
        </Command.Group>
      </Command.List>

      <div className="flex items-center gap-4 border-t border-gray-100 px-4 py-2.5 text-xs text-gray-400 dark:border-white/10">
        <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
        <span className="flex items-center gap-1.5"><Kbd>↵</Kbd> select</span>
      </div>
    </Command.Dialog>
  );
}
