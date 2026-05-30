'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, CreditCard, ChevronLeft } from 'lucide-react';

interface StepBuyerDetailsProps {
  buyerName: string;     setBuyerName: (v: string) => void;
  buyerEmail: string;    setBuyerEmail: (v: string) => void;
  buyerPhone: string;    setBuyerPhone: (v: string) => void;
  buyerCnic: string;     setBuyerCnic: (v: string) => void;
  primaryColor: string;
  secondaryColor: string;
  onBack: () => void;
  onNext: () => void;
}

interface FieldError {
  name?: string;
  email?: string;
  phone?: string;
  cnic?: string;
}

export default function StepBuyerDetails({
  buyerName, setBuyerName,
  buyerEmail, setBuyerEmail,
  buyerPhone, setBuyerPhone,
  buyerCnic, setBuyerCnic,
  primaryColor, secondaryColor,
  onBack, onNext,
}: StepBuyerDetailsProps) {
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (): FieldError => {
    const e: FieldError = {};
    if (!buyerName.trim())                                     e.name  = 'Full name is required.';
    if (!buyerEmail.trim())                                    e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail))  e.email = 'Enter a valid email address.';
    if (!buyerPhone.trim())                                    e.phone = 'Phone number is required.';
    else if (!/^(\+92|0)[0-9]{10}$/.test(buyerPhone.replace(/[\s\-]/g, ''))) e.phone = 'Enter an 11-digit Pakistani number (e.g. 0300-1234567).';
    if (!buyerCnic.trim())                                     e.cnic  = 'CNIC is required.';
    else if (!/^\d{5}-?\d{7}-?\d{1}$/.test(buyerCnic.replace(/\s/g, ''))) e.cnic = 'Enter CNIC in format: 12345-1234567-1';
    return e;
  };

  const handleNext = () => {
    const e = validate();
    setTouched({ name: true, email: true, phone: true, cnic: true });
    setErrors(e);
    if (Object.keys(e).length === 0) onNext();
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const inputClass = (field: keyof FieldError) => `
    w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium text-slate-900
    placeholder:text-slate-300 outline-none transition-all
    ${touched[field] && errors[field]
      ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
      : 'border-slate-200 bg-white focus:border-[var(--pc)] focus:ring-2 focus:ring-[var(--pc)]/10'
    }
  `;

  const fields = [
    {
      id: 'name' as keyof FieldError,
      label: 'Full Name',
      icon: <User className="w-4 h-4" />,
      value: buyerName,
      setter: setBuyerName,
      placeholder: 'Your name',
      type: 'text',
    },
    {
      id: 'email' as keyof FieldError,
      label: 'Email Address',
      icon: <Mail className="w-4 h-4" />,
      value: buyerEmail,
      setter: setBuyerEmail,
      placeholder: 'you@example.com',
      type: 'email',
    },
    {
      id: 'phone' as keyof FieldError,
      label: 'Phone Number',
      icon: <Phone className="w-4 h-4" />,
      value: buyerPhone,
      setter: setBuyerPhone,
      placeholder: '0300-1234567',
      type: 'tel',
    },
    {
      id: 'cnic' as keyof FieldError,
      label: 'CNIC Number',
      icon: <CreditCard className="w-4 h-4" />,
      value: buyerCnic,
      setter: setBuyerCnic,
      placeholder: '12345-1234567-1',
      type: 'text',
    },
  ];

  return (
    <div className="flex flex-col h-full" style={{ '--pc': primaryColor } as React.CSSProperties}>
      <div className="flex-1 px-6 py-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500 mb-2">
          Your Details
        </p>

        {fields.map(({ id, label, icon, value, setter, placeholder, type }) => (
          <div key={id}>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              {label}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300">
                {icon}
              </span>
              <input
                type={type}
                value={value}
                onChange={e => { setter(e.target.value); setErrors(validate()); }}
                onBlur={() => handleBlur(id)}
                placeholder={placeholder}
                className={inputClass(id)}
              />
            </div>
            {touched[id] && errors[id] && (
              <p className="text-xs text-red-500 font-medium mt-1 pl-1">{errors[id]}</p>
            )}
          </div>
        ))}

        <p className="text-[11px] text-brand-500 font-medium pt-1">
          Your information is kept secure and only used for this order.
        </p>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-4 py-3.5 rounded-2xl border border-slate-200 text-brand-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
          >
            Review Order →
          </button>
        </div>
      </div>
    </div>
  );
}