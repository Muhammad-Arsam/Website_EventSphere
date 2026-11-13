"use client";

import { useEffect, useState } from "react";
import { profileService } from "@/api/profileService";
import { UserProfile } from "@/types/profile.types";

/** Loads the signed-in user's profile once (used by the header user menu). */
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await profileService.getProfile();
        if (!cancelled) setProfile(data);
      } catch (error) {
        console.error("Failed to load profile data:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, isLoading };
}
