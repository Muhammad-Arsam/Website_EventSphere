"use client";

import { useEffect, useState } from "react";
import { organizationService } from "@/api/organizationService";

type Brand = { name: string | null; logoUrl: string | null };

/** Loads the organizer's own name and logo (only when `enabled`). */
export function useOrganizationBrand(enabled: boolean) {
  const [brand, setBrand] = useState<Brand>({ name: null, logoUrl: null });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setIsLoading(true);

    const load = async () => {
      try {
        const org = await organizationService.getMyOrganization();
        if (!cancelled && org) {
          setBrand({ name: org.name || null, logoUrl: org.imageUrl || null });
        }
      } catch (error) {
        console.error("Failed to fetch organization details:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { ...brand, isLoading };
}
