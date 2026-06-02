import { ThemeConfigJson } from '@/types/template.types';

export interface EventResponse {
  id: string;
  organizationId?: string; 
  organizationName?: string; 
  categoryId?: string; 
  categoryName?: string; 
  title: string;
  description?: string;
  venue?: string;
  imageUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lon?: number;
  startDateTime: string; 
  endDateTime: string; 
  status: string; 
  layoutType?: string;
  tags?: string[];
  typeSpecificData?: string;
  createdAt?: string;
  createdBy?: string;
  modifiedAt?: string;
  modifiedBy?: string;  
  location?: any; 
}

export interface CreateEventDraftRequest {
  title: string;
  categoryId: string;
  startDatetime: string; 
  endDatetime: string;
}

export interface UpdateEventRequest {
  title?: string;
  categoryId?: string;
  startDatetime?: string; 
  endDatetime?: string;
  description?: string;
  image?: File | null;
  venue?: string;
  lat?: number;
  lon?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  layoutType?: string;
  tags?: string[];
  typeSpecificData?: string;
}

// --- NEW SUB-EVENT TYPES ---

export interface SubEvent {
  id: string;
  eventId: string;
  title: string;
  description: string;
  imageUrl?: string;
  startTime: string;
  endTime: string;
  roomOrLocation?: string;
  capacityLimit?: number;
  rulesConfig?: string;
  createdBy?: string;
  createdAt?: string;
  modifiedBy?: string;
  modifiedAt?: string;
}

export interface AddSubEventRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  image?: File | null;
  roomOrLocation?: string;
  capacityLimit?: number;
  rulesConfig?: string;
}

export interface UpdateSubEventRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  image?: File | null;
  roomOrLocation?: string;
  capacityLimit?: number;
  rulesConfig?: string;
}

// --- LANDING PAGE TYPES ---

export interface LandingPage {
  id: string;
  eventId: string;
  slug: string;
  themeConfigJson: string; // stored as stringified JSON in DB
  createdBy?: string;
  createdAt?: string;
  modifiedBy?: string;
  modifiedAt?: string;
}

export interface ConfigureLandingPageRequest {
  slug: string;
  themeConfigJson: ThemeConfigJson; // typed object on frontend, stringified before sending
}

// --- PUBLIC API TYPES ---

export interface PublicEventCard {
  title: string;
  organization: string;
  category: string;
  slug: string;
  image: string;
  start: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  tags: string[];
}

export interface PublicEventDetails {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startDatetime: string;
  endDatetime: string;
  venueName: string;
  formattedAddress: string;
  searchTags: string[];
}

export interface PublicLandingPageDesign {
  customSlug: string;
  themeConfigJson: string; // stringified ThemeConfigJson
}

export interface PublicTicket {
  id: string;
  tierName: string;
  price: number;
  soldOut: boolean;
}

export interface PublicAgendaItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  roomOrLocation: string;
  imageUrl: string;
}

export interface PublicEventPageResponse {
  eventDetails: PublicEventDetails;
  landingPageDesign: PublicLandingPageDesign;
  tickets: PublicTicket[];
  agenda: PublicAgendaItem[];
}

// --- CHECKOUT TYPES ---
 
export interface TicketSelection {
  tierId: string;
  quantity: number;
}
 
export interface CheckoutRequest {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCnic: string;
  ticketSelections: TicketSelection[];
  selectedSubEventIds?: string[];
  promoCode?: string;
}
 
export interface CheckoutResponse {
  // The Swagger shows response as "string" (likely an order ID or confirmation code)
  // Adjust this if your backend returns a richer object
  orderId: string;
}

// --- ORDER TYPES ---

export interface EventOrder {
  orderId: string;
  orderReference: string;
  buyerName: string;
  buyerEmail: string;
  buyerCnic: string;
  buyerPhone: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}