'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { eventService } from '@/api/eventService';
import { categoryService } from '@/api/categoryService'; 
import { Category } from '@/types/category.types'; 
import { getOrgId } from '@/utils/token';
import { Calendar, Clock, Type, LayoutGrid, Loader2 } from 'lucide-react';
import Alert from '@/components/ui/alert/Alert'; 

export default function CreateEventForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [alertConfig, setAlertConfig] = useState<{
    id: number;
    variant: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    startDatetime: '',
    endDatetime: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const activeCategories = await categoryService.getActiveCategories();
        setCategories(activeCategories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        showAlert('error', 'Category Error', 'Failed to load event categories. Please refresh the page.');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showAlert = (variant: 'success' | 'error', title: string, message: string) => {
    setAlertConfig({ id: Date.now(), variant, title, message });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlertConfig(null);

    try {
      const orgId = getOrgId();
      if (!orgId) {
        throw new Error('Organization ID is missing. Please try logging in again.');
      }

      await eventService.createDraft(orgId, formData);
      
      showAlert('success', 'Draft Created!', 'Your event draft has been successfully saved.');
      
      setTimeout(() => {
        router.push('/events');
        router.refresh(); 
      }, 1500);

    } catch (err: any) {
      console.error('Failed to create draft:', err);
      showAlert('error', 'Creation Failed', err.message || 'Failed to create event. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Render the Alert toast dynamically if we have a config */}
      {alertConfig && (
        <Alert 
          key={alertConfig.id} 
          variant={alertConfig.variant} 
          title={alertConfig.title} 
          message={alertConfig.message} 
        />
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 max-w-2xl">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Type className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                placeholder="e.g., Annual Tech Summit 2026"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isLoadingCategories ? (
                  <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
                ) : (
                  <LayoutGrid className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <select
                id="categoryId"
                name="categoryId"
                required
                disabled={isLoadingCategories}
                value={formData.categoryId}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white disabled:bg-gray-50"
              >
                <option value="" disabled>
                  {isLoadingCategories ? 'Loading categories...' : 'Select a category...'}
                </option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Start Date */}
            <div>
              <label htmlFor="startDatetime" className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  id="startDatetime"
                  name="startDatetime"
                  required
                  value={formData.startDatetime}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDatetime" className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  id="endDatetime"
                  name="endDatetime"
                  required
                  value={formData.endDatetime}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || isLoadingCategories}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Draft...
              </>
            ) : (
              'Create Draft'
            )}
          </button>
        </div>
      </form>
    </>
  );
}