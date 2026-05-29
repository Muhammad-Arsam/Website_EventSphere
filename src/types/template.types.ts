export type TemplateName = 'STANDARD' | 'MINIMAL' | 'MODERN';

export type FontStyle = 'dm-sans' | 'playfair' | 'space-grotesk' | 'cabinet-grotesk' | 'syne';

export type TabName = 'overview' | 'schedule' | 'tickets' | 'location' | 'contact' | 'social';

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  whatsapp?: string;
  website?: string;
}

export interface ThemeConfigJson {
  templateName: TemplateName;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor?: string;
  fontStyle?: FontStyle;
  organizerName: string;
  organizerEmail?: string;
  organizerPhone?: string;
  socialLinks?: SocialLinks;
  enabledTabs?: TabName[];
}

export interface TicketTierPublic {
  id: string;
  tierName: string;
  price: number;
  soldOut: boolean;
}

export interface AgendaItemPublic {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  roomOrLocation: string;
  imageUrl: string;
}

export interface EventTemplateData {
  // From eventDetails (API)
  title: string;
  description: string;
  imageUrl: string;
  startDatetime: string;
  endDatetime: string;
  venueName: string;
  formattedAddress: string;
  tags: string[];
  // From themeConfigJson (organizer config)
  primaryColor: string;
  secondaryColor: string;
  backgroundColor?: string;
  fontStyle?: FontStyle;
  templateName: TemplateName;
  organizerName: string;
  organizerEmail?: string;
  organizerPhone?: string;
  socialLinks?: SocialLinks;
  enabledTabs?: TabName[];
  // From tickets & agenda (API)
  tickets: TicketTierPublic[];
  agenda: AgendaItemPublic[];
}