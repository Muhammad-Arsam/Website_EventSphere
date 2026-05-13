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