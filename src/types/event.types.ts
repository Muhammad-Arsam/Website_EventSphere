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