"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { authService } from "../../api/authService";
import { useHydrated } from "@/hooks/useHydrated";
import { useUserProfile } from "@/hooks/useUserProfile";
import UserAvatar from "./user-menu/UserAvatar";
import UserMenuHeader from "./user-menu/UserMenuHeader";

const itemClass =
  "group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 outline-none transition-colors data-highlighted:bg-brand-50 data-highlighted:text-brand-700 dark:text-gray-300 dark:data-highlighted:bg-brand-500/15 dark:data-highlighted:text-brand-200";

export default function UserDropdown({ roleLabel }: { roleLabel?: string }) {
  const { profile, isLoading } = useUserProfile();
  const isHydrated = useHydrated();

  const handleLogout = async () => {
    await authService.logout();
  };

  // Radix generates ids that can differ between server and browser.
  // Until the page is hydrated, show a same-size placeholder instead.
  if (!isHydrated) {
    return (
      <div
        aria-hidden
        className="h-11 w-14 rounded-xl border border-gray-200 bg-white shadow-theme-xs sm:w-44 dark:border-white/10 dark:bg-white/5"
      />
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="group flex h-11 items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 py-1 pl-1 pr-2.5 outline-none backdrop-blur transition-colors hover:border-brand-300/40 hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-brand-300/30"
        >
          <UserAvatar name={profile?.name} src={profile?.profilePic} className="size-9" />

          {isLoading ? (
            <span className="hidden h-3.5 w-20 animate-pulse rounded bg-white/15 sm:block" />
          ) : (
            <span className="hidden max-w-32 truncate text-sm font-medium text-gray-100 sm:block">
              {profile?.name}
            </span>
          )}

          <ChevronDown className="size-4 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          collisionPadding={12}
          className="z-999999 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xl data-[state=closed]:animate-menu-out data-[state=open]:animate-menu-in dark:border-white/10 dark:bg-gray-dark"
        >
          <UserMenuHeader profile={profile} roleLabel={roleLabel} />

          <div className="p-2">
            <DropdownMenu.Item asChild>
              <Link href="/profile" className={itemClass}>
                <UserRound className="size-[18px] text-gray-500 transition-colors group-data-highlighted:text-brand-600 dark:text-gray-400 dark:group-data-highlighted:text-brand-300" />
                Edit profile
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="my-1.5 h-px bg-gray-100 dark:bg-white/10" />

            <DropdownMenu.Item
              onSelect={handleLogout}
              className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 outline-none transition-colors data-highlighted:bg-error-50 data-highlighted:text-error-600 dark:text-gray-300 dark:data-highlighted:bg-error-500/10 dark:data-highlighted:text-error-400"
            >
              <LogOut className="size-[18px]" />
              Sign out
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
