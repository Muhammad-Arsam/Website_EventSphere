'use client';

import React, { useEffect, useState } from 'react';
import { X, Tag, Hash, Users, Calendar, Loader2 } from 'lucide-react';
import { discountService } from '@/api/discountService';
import { DiscountCode, AddDiscountRequest, UpdateDiscountRequest } from '@/types/discount.types';

interface DiscountCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string;
    existingDiscount: DiscountCode | null;
    onSuccess: () => void;
    showAlert: (variant: 'success' | 'error', title: string, message: string) => void;
}

interface FormState {
    code: string;
    discountValue: string;
    maxUses: string;
    validUntil: string;
}

const EMPTY_FORM: FormState = {
    code: '',
    discountValue: '',
    maxUses: '',
    validUntil: '',
};

export default function DiscountCodeModal({
    isOpen, onClose, eventId, existingDiscount, onSuccess, showAlert,
}: DiscountCodeModalProps) {
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<FormState>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = !!existingDiscount;

    // Populate form when editing
    useEffect(() => {
        if (existingDiscount) {
            // Convert ISO datetime to datetime-local format (YYYY-MM-DDTHH:mm)
            const dt = new Date(existingDiscount.validUntil);
            const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
            setForm({
                code: existingDiscount.code,
                discountValue: String(existingDiscount.discountValue),
                maxUses: String(existingDiscount.maxUses),
                validUntil: local,
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
    }, [existingDiscount, isOpen]);

    // Lock body scroll
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

    const validate = (): Partial<FormState> => {
        const e: Partial<FormState> = {};
        if (!form.code.trim())
            e.code = 'Code is required.';
        else if (!/^[A-Z0-9_-]{3,20}$/.test(form.code.trim()))
            e.code = 'Use 3–20 uppercase letters, digits, - or _.';
        const dv = Number(form.discountValue);
        if (!form.discountValue)
            e.discountValue = 'Discount value is required.';
        else if (isNaN(dv) || dv <= 0 || dv > 100)
            e.discountValue = 'Enter a value between 1 and 100.';
        const mu = Number(form.maxUses);
        if (!form.maxUses)
            e.maxUses = 'Max uses is required.';
        else if (isNaN(mu) || mu < 1 || !Number.isInteger(mu))
            e.maxUses = 'Enter a whole number of at least 1.';
        if (!form.validUntil)
            e.validUntil = 'Expiry date is required.';
        else if (new Date(form.validUntil) <= new Date())
            e.validUntil = 'Expiry date must be in the future.';
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }

        setIsSubmitting(true);
        try {
            const isoDate = new Date(form.validUntil).toISOString();

            if (isEditing && existingDiscount) {
                const payload: UpdateDiscountRequest = {
                    code: form.code.trim().toUpperCase(),
                    discountValue: Number(form.discountValue),
                    maxUses: Number(form.maxUses),
                    validUntil: isoDate,
                };
                await discountService.updateDiscount(eventId, existingDiscount.id, payload);
                showAlert('success', 'Discount Updated', `Code "${payload.code}" has been updated.`);
            } else {
                const payload: AddDiscountRequest = {
                    code: form.code.trim().toUpperCase(),
                    discountValue: Number(form.discountValue),
                    maxUses: Number(form.maxUses),
                    validUntil: isoDate,
                };
                await discountService.addDiscount(eventId, payload);
                showAlert('success', 'Discount Created', `Code "${payload.code}" has been added.`);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            showAlert('error', isEditing ? 'Update Failed' : 'Creation Failed', err.message || 'Something went wrong.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputBase = 'w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium text-gray-900 placeholder:text-gray-300 outline-none transition-all';
    const inputNormal = `${inputBase} border-gray-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100`;
    const inputErr = `${inputBase} border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100`;
    const cls = (f: keyof FormState) => errors[f] ? inputErr : inputNormal;

    return (
        <>
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
                            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                                <Tag className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">
                                    {isEditing ? 'Edit Discount Code' : 'Add Discount Code'}
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {isEditing ? 'Update the details below.' : 'Create a new promo code for this event.'}
                                </p>
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
                    <div className="px-6 py-5 space-y-4">

                        {/* Code */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                                Promo Code
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <input
                                    type="text"
                                    value={form.code}
                                    onChange={e => set('code', e.target.value.toUpperCase())}
                                    placeholder="SUMMER25"
                                    className={cls('code')}
                                />
                            </div>
                            {errors.code && <p className="text-xs text-red-500 font-medium mt-1">{errors.code}</p>}
                            <p className="text-[11px] text-gray-400 mt-1">Uppercase letters, digits, hyphens, underscores (3–20 chars).</p>
                        </div>

                        {/* Discount Value + Max Uses */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                                    Discount (%)
                                </label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={form.discountValue}
                                        onChange={e => set('discountValue', e.target.value)}
                                        placeholder="10"
                                        className={cls('discountValue')}
                                    />
                                </div>
                                {errors.discountValue && <p className="text-xs text-red-500 font-medium mt-1">{errors.discountValue}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                                    Max Uses
                                </label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.maxUses}
                                        onChange={e => set('maxUses', e.target.value)}
                                        placeholder="100"
                                        className={cls('maxUses')}
                                    />
                                </div>
                                {errors.maxUses && <p className="text-xs text-red-500 font-medium mt-1">{errors.maxUses}</p>}
                            </div>
                        </div>

                        {/* Valid Until */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                                Valid Until
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <input
                                    type="datetime-local"
                                    value={form.validUntil}
                                    onChange={e => set('validUntil', e.target.value)}
                                    className={cls('validUntil')}
                                />
                            </div>
                            {errors.validUntil && <p className="text-xs text-red-500 font-medium mt-1">{errors.validUntil}</p>}
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
                            {isSubmitting
                                ? (isEditing ? 'Saving...' : 'Adding...')
                                : (isEditing ? 'Save Changes' : 'Add Code')
                            }
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}