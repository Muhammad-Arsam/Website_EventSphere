'use client';

import React from 'react';
import { Organization } from '@/types/organization.types';
import Button from '../ui/button/Button';
import { useModal } from '@/hooks/useModal';
import EditWorkspaceModal from './EditWorkspaceModal'; // Adjust path if necessary

interface WorkspaceInfoCardProps {
  organization: Organization;
}

export default function WorkspaceInfoCard({ organization }: WorkspaceInfoCardProps) {
  // Hook for handling the modal state
  const { isOpen, openModal, closeModal } = useModal();

  // Helper to format the ISO date string into a readable format
  const formattedEndDate = organization.subscriptionEndDate
    ? new Date(organization.subscriptionEndDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'No active subscription';

  return (
    <>
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-brand-400 to-brand-600"></div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Organization Profile
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your organization details, billing, and current status.
              </p>
            </div>
            
            {/* Added onClick={openModal} here */}
            <Button 
              variant="outline" 
              size="sm" 
              className="shrink-0 font-medium shadow-sm"
              onClick={openModal}
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Organization
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            <div className="flex items-center gap-5 lg:w-1/3 w-full p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
              <div className="shrink-0 size-20 sm:size-24 bg-white dark:bg-gray-700 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                {organization.imageUrl ? (
                  <img 
                    src={organization.imageUrl} 
                    alt={`${organization.name} logo`} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <svg className="w-10 h-10 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              
              <div className="flex flex-col overflow-hidden">
                {/* Removed the 'truncate' class from the h3 tag below */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white" title={organization.name}>
                  {organization.name}
                </h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <svg className="w-4 h-4 mr-1.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{organization.email}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              
              <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Organization Status
                </p>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${organization.status === 'ACTIVE' ? 'bg-success-400' : 'bg-warning-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${organization.status === 'ACTIVE' ? 'bg-success-500' : 'bg-warning-500'}`}></span>
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {organization.status}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Subscription Plan
                </p>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    {organization.subscriptionStatus || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Renewal Date
                </p>
                <div className="flex items-center text-gray-900 dark:text-white font-medium">
                  <svg className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formattedEndDate}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Pending Balance
                </p>
                <div className="flex items-center text-gray-900 dark:text-white font-medium">
                  <div className="flex items-center justify-center size-6 rounded-full bg-error-50 dark:bg-error-500/10 text-error-600 dark:text-error-400 mr-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  ${organization.pendingBalance?.toFixed(2) || '0.00'}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <EditWorkspaceModal 
        isOpen={isOpen} 
        closeModal={closeModal} 
        organization={organization} 
      />
    </>
  );
}