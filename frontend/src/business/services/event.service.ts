import { eventRepository } from '../../data-access/repositories/event.repository';
import { imageFileStorage } from '../../integration/storage/image-file';
import { normalizeEventCategory } from '../../shared/constants/event-category';
import type {
  CalendarEventQueryParams,
  EventFormValues,
  EventItem,
  EventMutationPayload,
  EventQueryParams,
  HomeFeedResponse,
  RecommendedEventItem,
} from '../../shared/types/event';

const parseTags = (rawTags: string): string[] => {
  return rawTags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

export const eventService = {
  async getEvents(query?: EventQueryParams) {
    return eventRepository.getEvents(query);
  },
  async getPublicEvents(query?: EventQueryParams) {
    return eventRepository.getPublicEvents(query);
  },
  async getEventById(eventId: string) {
    return eventRepository.getEventById(eventId);
  },
  async createEvent(values: EventFormValues): Promise<EventItem> {
    const payload = await this.buildMutationPayload(values);
    return eventRepository.createEvent(payload);
  },
  async updateEvent(eventId: string, values: EventFormValues): Promise<EventItem> {
    const payload = await this.buildMutationPayload(values);
    return eventRepository.updateEvent(eventId, payload);
  },
  async updateEventStatus(
    eventId: string,
    status: EventFormValues['status'],
  ): Promise<EventItem> {
    return eventRepository.updateEventStatus(eventId, status);
  },
  async deleteEvent(eventId: string): Promise<void> {
    return eventRepository.deleteEvent(eventId);
  },
  async getRecommendations(limit = 4): Promise<RecommendedEventItem[]> {
    return eventRepository.getRecommendations(limit);
  },
  async getHomeFeed(limit = 6): Promise<HomeFeedResponse> {
    return eventRepository.getHomeFeed(limit);
  },
  async getCalendarEvents(query: CalendarEventQueryParams): Promise<EventItem[]> {
    return eventRepository.getCalendarEvents(query);
  },
  toEventFormValues(event?: EventItem): EventFormValues {
    if (!event) {
      return {
        title: '',
        description: '',
        category: 'Academic',
        location: '',
        timezone: 'Asia/Shanghai',
        startAt: '',
        endAt: '',
        capacity: '',
        tags: '',
        status: 'published',
        posterFile: null,
        posterUrl: undefined,
        removePoster: false,
      };
    }

    return {
      title: event.title,
      description: event.description,
      category: normalizeEventCategory(event.category),
      location: event.location,
      timezone: event.timezone,
      startAt: event.startAt.slice(0, 16),
      endAt: event.endAt.slice(0, 16),
      capacity: event.capacity ? String(event.capacity) : '',
      tags: event.tags.join(', '),
      status: event.status,
      posterFile: null,
      posterUrl: event.posterUrl,
      removePoster: false,
    };
  },
  async buildMutationPayload(values: EventFormValues): Promise<EventMutationPayload> {
    const payload: EventMutationPayload = {
      title: values.title.trim(),
      description: values.description.trim(),
      category: normalizeEventCategory(values.category),
      location: values.location.trim(),
      timezone: values.timezone.trim(),
      startAt: new Date(values.startAt).toISOString(),
      endAt: new Date(values.endAt).toISOString(),
      status: values.status,
    };

    if (values.capacity.trim()) {
      payload.capacity = Number(values.capacity);
    }

    const tags = parseTags(values.tags);
    if (tags.length > 0) {
      payload.tags = tags;
    }

    if (values.posterFile) {
      payload.posterDataUri = await imageFileStorage.toDataUri(values.posterFile);
    }

    if (values.removePoster) {
      payload.removePoster = true;
    }

    return payload;
  },
};
