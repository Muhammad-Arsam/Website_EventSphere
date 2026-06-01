'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Building2, Globe, Medal, Upload, Loader2, ImageIcon } from 'lucide-react';
import { sponsorService } from '@/api/sponsorService';
import { AddSponsorRequest } from '@/types/sponsor.types';

interface AddSponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSuccess: () => void;
  showAlert: (variant: 'success' | 'error', title: string, message: string) => void;
}

const SPONSOR_TIERS = ['PLATINUM', 'GOLD', 'SILVER', 'BRONZE'];

interface FormState {
  name: string;
  sponsorTier: string;
  websiteUrl: string;
}

const EMPTY_FORM: FormState = { name: '', sponsorTier: '', websiteUrl: '' };

export default function AddSponsorModal({
  isOpen, onClose, eventId, onSuccess, showAlert,
}: AddSponsorModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'logo', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setLogoFile(null);
      setLogoPreview(null);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, logo: 'Only image files are allowed.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: 'File size must be under 5MB.' }));
      return;
    }
    setLogoFile(file);
    setErrors(prev => ({ ...prev, logo: undefined }));
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Partial<Record<keyof FormState | 'logo', string>> = {};
    if (!form.name.trim()) e.name = 'Sponsor name is required.';
    if (!form.sponsorTier) e.sponsorTier = 'Please select a sponsor tier.';
    if (!logoFile) e.logo = 'Logo image is required.';
    if (form.websiteUrl && !/^https?:\/\/.+/.test(form.websiteUrl.trim())) {
      e.websiteUrl = 'Enter a valid URL starting with http:// or https://';
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setIsSubmitting(true);
    try {
      const payload: AddSponsorRequest = {
        name: form.name.trim(),
        sponsorTier: form.sponsorTier,
        logo: logoFile!,
        ...(form.websiteUrl.trim() && { websiteUrl: form.websiteUrl.trim() }),
      };
      await sponsorService.addSponsor(eventId, payload);
      showAlert('success', 'Sponsor Added', `"${payload.name}" has been added as a sponsor.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      showAlert('error', 'Failed to Add Sponsor', err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = 'w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium text-gray-900 placeholder:text-gray-300 outline-none transition-all';
  const inputNormal = `${inputBase} border-gray-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100`;
  const inputErr = `${inputBase} border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100`;

  return (
    <div
      className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Add Sponsor</h2>
              <p className="text-xs text-gray-400 mt-0.5">Add a new sponsor to this event.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">

          {/* Logo Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Logo <span className="text-red-400">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all
                ${errors.logo ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50/40'}`}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain p-3 rounded-xl" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-500">Click to upload logo</p>
                  <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, SVG up to 5MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {logoPreview && (
              <button
                onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                className="mt-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Remove image
              </button>
            )}
            {errors.logo && <p className="text-xs text-red-500 font-medium mt-1">{errors.logo}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Sponsor Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Acme Corporation"
                className={errors.name ? inputErr : inputNormal}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 font-medium mt-1">{errors.name}</p>}
          </div>

          {/* Tier */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Sponsor Tier <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SPONSOR_TIERS.map(tier => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => set('sponsorTier', tier)}
                  className={`py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                    form.sponsorTier === tier
                      ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:bg-brand-50'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
            {errors.sponsorTier && <p className="text-xs text-red-500 font-medium mt-1">{errors.sponsorTier}</p>}
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Website <span className="text-gray-400 font-normal normal-case">(optional)</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="url"
                value={form.websiteUrl}
                onChange={e => set('websiteUrl', e.target.value)}
                placeholder="https://example.com"
                className={errors.websiteUrl ? inputErr : inputNormal}
              />
            </div>
            {errors.websiteUrl && <p className="text-xs text-red-500 font-medium mt-1">{errors.websiteUrl}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Adding...' : 'Add Sponsor'}
          </button>
        </div>
      </div>
    </div>
  );
}