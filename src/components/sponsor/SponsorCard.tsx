'use client';

import React from 'react';
import {
  Building2,
  Globe,
  Trash2,
  Crown,
  Gem,
  Award,
  Medal,
} from 'lucide-react';
import { Sponsor } from '@/types/sponsor.types';

interface SponsorCardProps {
  sponsor: Sponsor;
  onDelete: (sponsor: Sponsor) => void;
}

const TIER_CONFIG: Record<
  string,
  {
    badge: string;
    accent: string;
    glow: string;
    icon: React.ReactNode;
  }
> = {
  PLATINUM: {
    badge:
      'bg-slate-100 text-slate-700 border-slate-200',
    accent: 'from-slate-400 to-slate-200',
    glow: 'hover:shadow-slate-200/80',
    icon: <Gem className="w-3.5 h-3.5" />,
  },
  GOLD: {
    badge:
      'bg-amber-50 text-amber-700 border-amber-200',
    accent: 'from-amber-500 to-yellow-300',
    glow: 'hover:shadow-amber-200/80',
    icon: <Crown className="w-3.5 h-3.5" />,
  },
  SILVER: {
    badge:
      'bg-gray-100 text-gray-700 border-gray-200',
    accent: 'from-gray-400 to-gray-200',
    glow: 'hover:shadow-gray-200/80',
    icon: <Award className="w-3.5 h-3.5" />,
  },
  BRONZE: {
    badge:
      'bg-orange-50 text-orange-700 border-orange-200',
    accent: 'from-orange-500 to-orange-300',
    glow: 'hover:shadow-orange-200/80',
    icon: <Medal className="w-3.5 h-3.5" />,
  },
};

const DEFAULT_CONFIG = {
  badge:
    'bg-brand-50 text-brand-700 border-brand-100',
  accent: 'from-brand-500 to-brand-300',
  glow: 'hover:shadow-brand-200/80',
  icon: <Medal className="w-3.5 h-3.5" />,
};

export default function SponsorCard({
  sponsor,
  onDelete,
}: SponsorCardProps) {
  const tier =
    TIER_CONFIG[sponsor.sponsorTier?.toUpperCase()] ??
    DEFAULT_CONFIG;

  return (
    <div
      className={`
        relative overflow-hidden rounded-3xl
        bg-white
        border border-gray-100
        shadow-sm
        hover:shadow-xl
        ${tier.glow}
        hover:-translate-y-1
        transition-all duration-300
        group
      `}
    >
      {/* Left Accent */}
      <div
        className={`absolute left-0 top-0 h-full w-1.5 bg-linear-to-b ${tier.accent}`}
      />

      <div className="p-5 flex items-center gap-4">
        {/* Logo */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-gray-50 to-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
            {sponsor.logoUrl ? (
              <img
                src={sponsor.logoUrl}
                alt={sponsor.name}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <Building2 className="w-7 h-7 text-gray-300" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 text-lg truncate">
              {sponsor.name}
            </h3>

            <div
              className={`
                inline-flex items-center gap-1.5
                px-3 py-1
                rounded-full
                border
                text-xs
                font-bold
                tracking-wide
                ${tier.badge}
              `}
            >
              {tier.icon}
              {sponsor.sponsorTier}
            </div>
          </div>

          {sponsor.websiteUrl ? (
            <a
              href={sponsor.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex
                items-center
                gap-2
                px-3
                py-1.5
                rounded-full
                bg-gray-50
                hover:bg-brand-50
                text-sm
                text-gray-600
                hover:text-brand-600
                transition-colors
              "
            >
              <Globe className="w-4 h-4" />
              <span className="truncate max-w-[250px]">
                {sponsor.websiteUrl.replace(
                  /^https?:\/\//,
                  ''
                )}
              </span>
            </a>
          ) : (
            <div className="inline-flex items-center gap-2 text-sm text-gray-400">
              <Globe className="w-4 h-4" />
              No website provided
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(sponsor)}
          className="
            opacity-0
            group-hover:opacity-100
            transition-all
            duration-200
            p-3
            rounded-2xl
            bg-red-50
            text-red-500
            hover:bg-red-100
            hover:scale-105
          "
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}