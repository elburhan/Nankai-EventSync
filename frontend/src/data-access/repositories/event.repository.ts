import type { AxiosError } from 'axios';

import { httpClient, publicHttpClient } from '../../integration/api/http-client';
import type { ApiErrorResponse, ApiResponse } from '../../shared/types/api';
import type {
  CalendarEventQueryParams,
  EventItem,
  EventMutationPayload,
  EventQueryParams,
  HomeFeedResponse,
  RecommendedEventItem,
  RsvpResponse,
} from '../../shared/types/event';

const extractErrorMessage = (error: unknown): string => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message ?? 'Unable to load events right now.';
};

export const eventRepository = {
  async getEvents(query?: EventQueryParams): Promise<{ items: EventItem[]; pagination?: ApiResponse<EventItem[]>['pagination'] }> {
    try {
      const response = await httpClient.get<ApiResponse<EventItem[]>>('/events', {
        params: query,
      });
      return {
        items: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  async getPublicEvents(query?: EventQueryParams): Promise<{ items: EventItem[]; pagination?: ApiResponse<EventItem[]>['pagination'] }> {
    try {
      const response = await publicHttpClient.get<ApiResponse<EventItem[]>>('/events', {
        params: query,
      });
      return {
        items: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  async getEventById(eventId: string): Promise<EventItem> {
    try {
      const response = await httpClient.get<ApiResponse<EventItem>>(`/events/${eventId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  async createEvent(payload: EventMutationPayload): Promise<EventItem> {
    try {
      const response = await httpClient.post<ApiResponse<EventItem>>('/events', payload);
      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  async updateEvent(eventId: string, payload: Partial<EventMutationPayload>): Promise<EventItem> {
    try {
      const response = await httpClient.patch<ApiResponse<EventItem>>(`/events/${eventId}`, payload);
      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  async updateEventStatus(eventId: string, status: EventItem['status']): Promise<EventItem> {
    try {
      const response = await httpClient.patch<ApiResponse<EventItem>>(`/events/${eventId}/status`, { status });
      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  async createRsvp(eventId: string): Promise<RsvpResponse> {
    try {
      const response = await httpClient.post<ApiResponse<RsvpResponse>>(`/events/${eventId}/rsvp`);
      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  async cancelRsvp(eventId: string): Promise<RsvpResponse> {
    try {
      const response = await httpClient.delete<ApiResponse<RsvpResponse>>(`/events/${eventId}/rsvp`);
      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await httpClient.delete(`/events/${eventId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  async getRecommendations(limit = 4): Promise<RecommendedEventItem[]> {
    try {
      const response = await httpClient.post<ApiResponse<RecommendedEventItem[]>>('/recommendations', {
        limit,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  async getHomeFeed(limit = 6): Promise<HomeFeedResponse> {
    try {
      const response = await httpClient.get<ApiResponse<RecommendedEventItem[]>>('/home-feed', {
        params: { limit },
      });
      return {
        items: response.data.data,
        meta: response.data.meta as HomeFeedResponse['meta'],
      };
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  async getCalendarEvents(query: CalendarEventQueryParams): Promise<EventItem[]> {
    try {
      const response = await httpClient.get<ApiResponse<EventItem[]>>('/calendar-events', {
        params: query,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
};
