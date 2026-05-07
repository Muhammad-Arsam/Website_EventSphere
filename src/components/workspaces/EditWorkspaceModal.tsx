'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { organizationService } from '@/api/organizationService';
import { Organization } from '@/types/organization.types';

interface EditWorkspaceModalProps {
  isOpen: boolean;
  closeModal: () => void;
  organization: Organization;
}

export default function EditWorkspaceModal({ isOpen, closeModal, organization }: EditWorkspaceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize state including email as required by your update API
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Pre-fill the form when the modal opens or organization data changes
  useEffect(() => {
    if (organization) {
      setFormData({ 
        name: organization.name || '',
        email: organization.email || '',
      });
      // Reset image file on open
      setImageFile(null);
      setError(null);
    }
  }, [organization, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (formData.name.length < 5 || formData.name.length > 50) {
      setError("Organization Name must be between 5 and 50 characters.");
      return;
    }
    if (!formData.email) {
      setError("Contact Email is required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Calls the API with ID and the payload containing name, email, and optionally the image
      await organizationService.updateOrganization(organization.id, {
        name: formData.name,
        email: formData.email,
        ...(imageFile && { image: imageFile }), 
      });

      closeModal();
      window.location.reload(); // Reload to fetch fresh data, matching your UserMetaCard pattern
    } catch (err: any) {
      console.error("Failed to update workspace:", err);
      setError(err.message || "Failed to update workspace.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        
        {/* Header */}
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Organization
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update your organization's details and logo.
          </p>
        </div>

        <div className="flex flex-col">
          <div className="custom-scrollbar overflow-y-auto px-2 pb-3">
            <div className="grid grid-cols-1 gap-y-6">
              
              {/* Organization Name Input */}
              <div className="col-span-1">
                <Label>Organization Name</Label>
                <div className="mt-1.5">
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    Must be between 5 and 50 characters.
                  </p>
                </div>
              </div>

              {/* Organization Email Input */}
              <div className="col-span-1">
                <Label>Contact Email</Label>
                <div className="mt-1.5">
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Organization Logo File Input */}
              <div className="col-span-1">
                <Label>Organization Logo</Label>
                <div className="mt-1.5">
                  <input
                    type="file"
                    name="imageFile"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-gray-800 dark:file:text-brand-400 dark:hover:file:bg-gray-700 transition-colors cursor-pointer"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="col-span-1 p-3 rounded-xl bg-error-50 dark:bg-error-500/10 border border-error-100 dark:border-error-800">
                  <p className="text-sm font-medium text-error-600 dark:text-error-400">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 px-2 mt-8 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeModal} disabled={isLoading}>
              Close
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}