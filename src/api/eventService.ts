import API from '@/api/api.config';
import { EventResponse, CreateEventDraftRequest, UpdateEventRequest } from '@/types/event.types';

export const eventService = {
  getOrgEvents: async (organizationId: string): Promise<EventResponse[]> => {
    const response = await API.get<EventResponse[]>(`/api/event/get-org-events/${organizationId}`);
    return response.data;
  },

  getOrgEventById: async (eventId: string): Promise<EventResponse> => {
    const response = await API.get<EventResponse>(`/api/event/get-org-event-by-id/${eventId}`);
    return response.data;
  },

  createDraft: async (organizationId: string, data: CreateEventDraftRequest): Promise<EventResponse> => {
    const response = await API.post<EventResponse>(`/api/event/create-draft/${organizationId}`, data);
    return response.data;
  },

  updateEvent: async (eventId: string, data: UpdateEventRequest): Promise<string> => {
    const formData = new FormData();

    if (data.title) formData.append('title', data.title);
    if (data.categoryId) formData.append('categoryId', data.categoryId);
    if (data.startDatetime) formData.append('startDatetime', data.startDatetime);
    if (data.endDatetime) formData.append('endDatetime', data.endDatetime);
    if (data.description) formData.append('description', data.description);
    if (data.venue) formData.append('venue', data.venue);
    if (data.lat !== undefined) formData.append('lat', data.lat.toString());
    if (data.lon !== undefined) formData.append('lon', data.lon.toString());
    if (data.address) formData.append('address', data.address);
    if (data.city) formData.append('city', data.city);
    if (data.state) formData.append('state', data.state);
    if (data.country) formData.append('country', data.country);
    if (data.layoutType) formData.append('layoutType', data.layoutType);
    if (data.typeSpecificData) formData.append('typeSpecificData', data.typeSpecificData);

    if (data.image) {
      formData.append('image', data.image);
    }

    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tag => formData.append('tags', tag));
    }

    const response = await API.patch<string>(`/api/event/update-event/${eventId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }
};