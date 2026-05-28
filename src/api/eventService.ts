import axios from 'axios';
import API from '@/api/api.config';
import { 
  EventResponse, 
  CreateEventDraftRequest, 
  UpdateEventRequest,
  SubEvent,
  AddSubEventRequest,
  UpdateSubEventRequest,
  LandingPage,
  ConfigureLandingPageRequest
} from '@/types/event.types';
import { ThemeConfigJson } from '@/types/template.types';

export const eventService = {
  getOrgEvents: async (organizationId: string): Promise<EventResponse[]> => {
    try {
      const response = await API.get<EventResponse[]>(`/api/event/get-org-events/${organizationId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to fetch organization events.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  getOrgEventById: async (eventId: string): Promise<EventResponse> => {
    try {
      const response = await API.get<EventResponse>(`/api/event/get-org-event-by-id/${eventId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to fetch event details.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  createDraft: async (organizationId: string, data: CreateEventDraftRequest): Promise<EventResponse> => {
    try {
      const response = await API.post<EventResponse>(`/api/event/create-draft/${organizationId}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to create event draft.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  updateEvent: async (eventId: string, data: UpdateEventRequest): Promise<string> => {
    try {
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
        data.tags.forEach((tag) => formData.append('tags', tag));
      }

      const response = await API.patch<string>(`/api/event/update-event/${eventId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to update event.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  // --- NEW SUB-EVENT API METHODS ---

  addSubEvent: async (eventId: string, data: AddSubEventRequest): Promise<SubEvent> => {
    try {
      const formData = new FormData();
      
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('startTime', data.startTime);
      formData.append('endTime', data.endTime);
      
      if (data.image) formData.append('image', data.image);
      if (data.roomOrLocation) formData.append('roomOrLocation', data.roomOrLocation);
      if (data.capacityLimit !== undefined) formData.append('capacityLimit', data.capacityLimit.toString());
      if (data.rulesConfig) formData.append('rulesConfig', data.rulesConfig);

      const response = await API.post<SubEvent>(`/api/event/add-sub-event/${eventId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to add sub-event.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  updateSubEvent: async (eventId: string, subEventId: string, data: UpdateSubEventRequest): Promise<SubEvent> => {
    try {
      const formData = new FormData();

      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.startTime) formData.append('startTime', data.startTime);
      if (data.endTime) formData.append('endTime', data.endTime);
      if (data.image) formData.append('image', data.image);
      if (data.roomOrLocation) formData.append('roomOrLocation', data.roomOrLocation);
      if (data.capacityLimit !== undefined) formData.append('capacityLimit', data.capacityLimit.toString());
      if (data.rulesConfig) formData.append('rulesConfig', data.rulesConfig);

      const response = await API.patch<SubEvent>(`/api/event/update-sub-event/${eventId}/${subEventId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to update sub-event.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  getAllSubEvents: async (eventId: string): Promise<SubEvent[]> => {
    try {
      const response = await API.get<SubEvent[]>(`/api/event/get-sub-events/${eventId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to fetch sub-events.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  getSubEventById: async (subEventId: string): Promise<SubEvent> => {
    try {
      const response = await API.get<SubEvent>(`/api/event/get-sub-event-by-id/${subEventId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to fetch sub-event details.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  deleteSubEvent: async (eventId: string, subEventId: string): Promise<string> => {
    try {
      const response = await API.delete<string>(`/api/event/delete-sub-event/${eventId}/${subEventId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to delete sub-event.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  // --- PUBLISH / UNPUBLISH ---

  publishEvent: async (eventId: string): Promise<string> => {
    try {
      const response = await API.post<string>(`/api/event/publish/${eventId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to publish event.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  unpublishEvent: async (eventId: string): Promise<string> => {
    try {
      const response = await API.post<string>(`/api/event/unpublish/${eventId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to unpublish event.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  // --- LANDING PAGE ---

configureLandingPage: async (
  eventId: string,
  data: ConfigureLandingPageRequest
): Promise<LandingPage> => {
  try {
    const payload = {
      slug: data.slug,
      themeConfigJson: JSON.stringify(data.themeConfigJson), // stringify here
    };
    const response = await API.patch<LandingPage>(
      `/api/event/configure-landing-page/${eventId}`,
      payload
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data?.detail || 'Failed to configure landing page.';
      throw new Error(backendMessage);
    }
    throw new Error('Network error. Please check your connection.');
  }
},

  getLandingPageSettings: async (eventId: string): Promise<LandingPage> => {
    try {
      const response = await API.get<LandingPage>(
        `/api/event/get-landing-page-settings/${eventId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.detail || 'Failed to fetch landing page settings.';
        throw new Error(backendMessage);
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  parseLandingPageTheme: (landingPage: LandingPage): ThemeConfigJson | null => {
  try {
    return JSON.parse(landingPage.themeConfigJson) as ThemeConfigJson;
  } catch {
    return null;
  }
},
};