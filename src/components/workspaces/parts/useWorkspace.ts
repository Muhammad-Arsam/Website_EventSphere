'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { organizationService } from '@/api/organizationService';
import type { Organization, OrganizationWallet } from '@/types/organization.types';

interface Loadable<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Loads the organization, then its wallet. Both have their own loading and error state,
// so a wallet problem never hides the organization details.
export function useWorkspace() {
  const router = useRouter();
  const [organization, setOrganization] = useState<Loadable<Organization>>({ data: null, loading: true, error: null });
  const [wallet, setWallet] = useState<Loadable<OrganizationWallet>>({ data: null, loading: true, error: null });
  const [refreshing, setRefreshing] = useState(false);

  const loadWallet = useCallback(async (organizationId: string) => {
    try {
      const data = await organizationService.getWallet(organizationId);
      setWallet({ data, loading: false, error: null });
    } catch (err) {
      setWallet({ data: null, loading: false, error: err instanceof Error ? err.message : 'Failed to load wallet.' });
    }
  }, []);

  const loadOrganization = useCallback(async () => {
    try {
      const data = await organizationService.getMyOrganization();
      if (!data) {
        // No organization yet: go and create one (the skeleton stays visible meanwhile)
        router.push('/create-organization');
        return null;
      }
      setOrganization({ data, loading: false, error: null });
      return data;
    } catch (err) {
      setOrganization({ data: null, loading: false, error: err instanceof Error ? err.message : 'Failed to load workspace.' });
      return null;
    }
  }, [router]);

  // First load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const org = await loadOrganization();
      if (org && !cancelled) await loadWallet(org.id);
    })();
    return () => { cancelled = true; };
  }, [loadOrganization, loadWallet]);

  // Refresh button / "Try again": reload everything, keep the old data on screen meanwhile
  const reload = useCallback(async () => {
    setRefreshing(true);
    // keep showing the old data while reloading; show the skeleton only if there is no data yet
    setOrganization((prev) => ({ ...prev, error: null, loading: prev.data === null }));
    const org = await loadOrganization();
    if (org) await loadWallet(org.id);
    setRefreshing(false);
  }, [loadOrganization, loadWallet]);

  return { organization, wallet, refreshing, reload };
}
