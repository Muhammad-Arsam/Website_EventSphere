'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { organizationService } from '@/api/organizationService';

import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import Alert from '@/components/ui/alert/Alert';

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (alert && alert.variant !== 'success') {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlert(null);

    // Basic frontend validation
    if (!formData.name || !formData.email || !imageFile) {
      setAlert({
        variant: "warning",
        title: "Missing Fields",
        message: "Please fill out all fields and upload an organization logo.",
      });
      return;
    }

    // Name length validation
    if (formData.name.length < 5 || formData.name.length > 50) {
      setAlert({
        variant: "warning",
        title: "Invalid Name",
        message: "Organization Name must be between 5 and 50 characters.",
      });
      return;
    }

    setIsLoading(true);

    try {
      await organizationService.createOrganization({
        name: formData.name,
        email: formData.email,
        image: imageFile,
      });

      setAlert({
        variant: "success",
        title: "Welcome aboard!",
        message: "Your workspace has been created. Redirecting...",
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error: any) {
      setAlert({
        variant: "error",
        title: "Creation Failed",
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 blur-[100px] bg-linear-to-b from-brand-400 to-transparent pointer-events-none rounded-full" />

      {alert && (
        <div className="fixed top-10 right-10 z-50 w-full max-w-sm shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
          />
        </div>
      )}

      {/* Main Card */}
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-4xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 relative z-10">
        <div className="p-6 sm:p-8 lg:px-10">
          
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Create Organization
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Set up your organization profile to unlock your dashboard and start managing events.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Organization Name <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="name"
                placeholder="e.g. Acme Events Co."
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <p className={`text-xs ${
                formData.name.length > 0 && (formData.name.length < 5 || formData.name.length > 50)
                  ? 'text-error-500' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                Must be between 5 and 50 characters.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Contact Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                name="email"
                placeholder="contact@acmeevents.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Organization Logo <span className="text-error-500">*</span>
              </Label>
              
              <div className="mt-1 flex items-center gap-5">
                
                <div className="shrink-0 size-20 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden shadow-sm">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                
                <div className="flex-1">
                  <label className="flex flex-col justify-center px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-brand-50/50 hover:border-brand-300 dark:hover:bg-gray-800 transition-all duration-200 group">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {imageFile ? "Change Logo" : "Click to upload file"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      PNG, JPG or WEBP (Max 5MB)
                    </p>
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isLoading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                className="w-full py-3 text-base rounded-xl font-medium transition-transform active:scale-[0.98]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Organization...
                  </span>
                ) : (
                  "Create Organization"
                )}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}