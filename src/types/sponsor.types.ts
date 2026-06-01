export interface Sponsor {
  id: string;
  eventId: string;
  name: string;
  sponsorTier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | string;
  logoUrl: string;
  websiteUrl: string;
  createdAt: string;
  createdBy: string;
  modifiedAt: string;
  modifiedBy: string;
}

export interface AddSponsorRequest {
  name: string;
  sponsorTier: string;
  logo: File;
  websiteUrl?: string;
}