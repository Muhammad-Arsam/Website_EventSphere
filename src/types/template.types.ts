export type TemplateName = 'STANDARD' | 'MINIMAL' | 'MODERN';

export interface ThemeConfigJson {
  templateName: TemplateName;
  primaryColor: string;
  secondaryColor: string;
  organizerName: string;
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
  templateName: TemplateName;
  organizerName: string;
  // From tickets & agenda (API)
  tickets: TicketTierPublic[];
  agenda: AgendaItemPublic[];
}

// export interface EventTemplateData {
//   title: string;
//   description: string;
//   date: string;
//   time: string;
//   location: string;
//   imageUrl: string;
//   organizerName: string;
//   startingPrice: number;
//   tags: string[];
//   primaryColor: string;
//   secondaryColor: string;
//   templateName: TemplateName;
// }