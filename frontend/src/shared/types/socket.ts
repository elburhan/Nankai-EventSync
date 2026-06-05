import type { EventMessage, EventRoomState } from './event';

export interface SocketErrorPayload {
  message: string;
  statusCode: number;
}

export interface EventRoomLeftPayload {
  eventId: string;
}

export interface RsvpUpdatedPayload {
  eventId: string;
  attendeeCount: number;
}

export interface MessageCreatedPayload {
  eventId: string;
  message: EventMessage;
}

export type EventJoinedPayload = EventRoomState;
