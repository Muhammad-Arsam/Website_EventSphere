'use client';

import React from 'react';
import { Sponsor } from '@/types/sponsor.types';
import SponsorCard from './SponsorCard';

interface SponsorListProps {
  sponsors: Sponsor[];
  onDelete: (sponsor: Sponsor) => void;
}

export default function SponsorList({ sponsors, onDelete }: SponsorListProps) {
  return (
    <div className="space-y-3">
      {sponsors.map((sponsor) => (
        <SponsorCard
          key={sponsor.id}
          sponsor={sponsor}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}