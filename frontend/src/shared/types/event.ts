export interface EventOrganizer {
  id: string;
  fullName: string;
  email: string;
}

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  timezone: string;
  startAt: string;
  endAt: string;
  posterUrl?: string;
  capacity?: number;
  attendeeCount: number;
  tags: string[];
  status: EventStatus;
  organizer: EventOrganizer;
  createdAt: string;
  updatedAt: string;
}

export interface EventFormValues {
  title: string;
  description: string;
  category: string;
  location: string;
  timezone: string;
  startAt: string;
  endAt: string;
  capacity: string;
  tags: string;
  status: EventStatus;
  posterFile: File | null;
  posterUrl?: string;
  removePoster: boolean;
}

export interface EventMutationPayload {
  title: string;
  description: string;
  category: string;
  location: string;
  timezone: string;
  startAt: string;
  endAt: string;
  capacity?: number;
  tags?: string[];
  status: EventStatus;
  posterDataUri?: string;
  removePoster?: boolean;
}

export interface EventListResponse {
  items: EventItem[];
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface EventQueryParams {
  q?: string;
  category?: string;
  status?: EventStatus;
  organizerId?: string;
  upcoming?: boolean;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface CalendarEventQueryParams {
  q?: string;
  status?: EventStatus;
  organizerId?: string;
  from: string;
  to: string;
}

export interface RsvpResponse {
  eventId: string;
  attendeeCount: number;
  status: 'going' | 'cancelled';
}

export interface EventMessage {
  id: string;
  eventId: string;
  sender: {
    id: string;
    fullName: string;
    role: 'student' | 'organizer' | 'admin';
  };
  body: string;
  messageType: 'user' | 'system';
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventRoomState {
  eventId: string;
  attendeeCount: number;
  isAttending: boolean;
  canChat: boolean;
  messages: EventMessage[];
}

export interface RecommendedEventItem {
  event: EventItem;
  reason: string;
}

export interface HomeFeedResponse {
  items: RecommendedEventItem[];
  meta?: {
    interactionCount: number;
    isColdStart: boolean;
    usedFallback: boolean;
    debugFallbackPath?: 'none' | 'fresh' | 'organizerSafe' | 'global';
    debugPersonalizedCount?: number;
    debugFallbackCount?: number;
  };
}
