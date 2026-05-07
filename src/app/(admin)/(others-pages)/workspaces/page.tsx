'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { organizationService } from '@/api/organizationService';
import { Organization } from '@/types/organization.types';
import WorkspaceInfoCard from '@/components/workspaces/WorkspaceInfoCard';

export default function WorkspacesPage() {
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const orgData = await organizationService.getMyOrganization();
        
        if (!orgData) {
          router.push('/create-organization');
          return;
        }

        setOrganization(orgData);
      } catch (err: any) {
        setError(err.message || 'Failed to load workspace.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 dark:text-gray-400">Loading workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-error-700 bg-error-50 rounded-lg dark:bg-error-900/30 dark:text-error-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Organization
        </h1>
        {/* <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your organization details and settings.
        </p> */}
      </div>

      {organization && <WorkspaceInfoCard organization={organization} />}
    </div>
  );
}