import { eventRepository } from '../../data-access/repositories/event.repository';
import { socketRepository } from '../../data-access/repositories/socket.repository';
import type { EventItem, EventRoomState, RsvpResponse } from '../../shared/types/event';
import type {
  EventJoinedPayload,
  MessageCreatedPayload,
  RsvpUpdatedPayload,
  SocketErrorPayload,
} from '../../shared/types/socket';

export const eventRoomService = {
  async getEventById(eventId: string): Promise<EventItem> {
    return eventRepository.getEventById(eventId);
  },
  async createRsvp(eventId: string): Promise<RsvpResponse> {
    return eventRepository.createRsvp(eventId);
  },
  async cancelRsvp(eventId: string): Promise<RsvpResponse> {
    return eventRepository.cancelRsvp(eventId);
  },
  connect(token: string): void {
    socketRepository.ensureConnected(token);
  },
  joinRoom(eventId: string): void {
    socketRepository.joinEventRoom(eventId);
  },
  leaveRoom(eventId: string): void {
    socketRepository.leaveEventRoom(eventId);
  },
  sendMessage(eventId: string, body: string): Promise<void> {
    return socketRepository.sendMessage(eventId, body);
  },
  onEventJoined(listener: (payload: EventJoinedPayload) => void): () => void {
    return socketRepository.onEventJoined(listener);
  },
  onRsvpUpdated(listener: (payload: RsvpUpdatedPayload) => void): () => void {
    return socketRepository.onRsvpUpdated(listener);
  },
  onMessageCreated(listener: (payload: MessageCreatedPayload) => void): () => void {
    return socketRepository.onMessageCreated(listener);
  },
  onSocketError(listener: (payload: SocketErrorPayload) => void): () => void {
    return socketRepository.onSocketError(listener);
  },
  mergeRoomState(event: EventItem, roomState: EventRoomState): EventItem {
    return {
      ...event,
      attendeeCount: roomState.attendeeCount,
    };
  },
};
