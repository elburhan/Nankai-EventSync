import type { Socket } from 'socket.io-client';

import { socketClient } from '../../integration/socket/socket-client';
import { SOCKET_EVENTS } from '../../shared/constants/socket-event';
import type {
  EventJoinedPayload,
  EventRoomLeftPayload,
  MessageCreatedPayload,
  RsvpUpdatedPayload,
  SocketErrorPayload,
} from '../../shared/types/socket';

export const socketRepository = {
  connect(token: string): Socket {
    return socketClient.connect(token);
  },
  ensureConnected(token: string): Socket {
    return socketClient.ensureConnected(token);
  },
  disconnect(): void {
    socketClient.disconnect();
  },
  getInstance(): Socket | null {
    return socketClient.getInstance();
  },
  joinEventRoom(eventId: string): void {
    socketClient.joinEventRoom(eventId);
  },
  leaveEventRoom(eventId: string): void {
    socketClient.leaveEventRoom(eventId);
  },
  sendMessage(eventId: string, body: string): Promise<void> {
    return socketClient.sendMessage(eventId, body);
  },
  onEventJoined(listener: (payload: EventJoinedPayload) => void): () => void {
    const socket = socketClient.getInstance();
    if (!socket) return () => undefined;
    socket.on(SOCKET_EVENTS.EVENT_JOINED, listener);
    return () => socket.off(SOCKET_EVENTS.EVENT_JOINED, listener);
  },
  onEventLeft(listener: (payload: EventRoomLeftPayload) => void): () => void {
    const socket = socketClient.getInstance();
    if (!socket) return () => undefined;
    socket.on(SOCKET_EVENTS.EVENT_LEFT, listener);
    return () => socket.off(SOCKET_EVENTS.EVENT_LEFT, listener);
  },
  onRsvpUpdated(listener: (payload: RsvpUpdatedPayload) => void): () => void {
    const socket = socketClient.getInstance();
    if (!socket) return () => undefined;
    socket.on(SOCKET_EVENTS.RSVP_UPDATED, listener);
    return () => socket.off(SOCKET_EVENTS.RSVP_UPDATED, listener);
  },
  onMessageCreated(listener: (payload: MessageCreatedPayload) => void): () => void {
    const socket = socketClient.getInstance();
    if (!socket) return () => undefined;
    socket.on(SOCKET_EVENTS.MESSAGE_CREATED, listener);
    return () => socket.off(SOCKET_EVENTS.MESSAGE_CREATED, listener);
  },
  onSocketError(listener: (payload: SocketErrorPayload) => void): () => void {
    const socket = socketClient.getInstance();
    if (!socket) return () => undefined;
    socket.on(SOCKET_EVENTS.ERROR, listener);
    return () => socket.off(SOCKET_EVENTS.ERROR, listener);
  },
};
