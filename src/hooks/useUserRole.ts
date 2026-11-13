"use client";

import { useSyncExternalStore } from "react";
import { getRole } from "@/utils/token";
import { useHydrated } from "./useHydrated";

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

/**
 * Reads the saved role from localStorage.
 * On the server (and first client render) role is `null` and isReady is `false`,
 * so there is no hydration mismatch.
 */
export function useUserRole() {
  const isReady = useHydrated();
  const role = useSyncExternalStore(subscribe, getRole, () => null);
  return { role, isReady };
}
