import type { Server } from 'socket.io';

import type { MessageResponseDto } from '../../business/dto/message-response.dto';
import { getEventRoomName, SOCKET_EVENTS } from '../../shared/constants/socket-event';

let ioInstance: Server | null = null;

export const setSocketServerInstance = (io: Server): void => {
  ioInstance = io;
};

export const emitRsvpUpdated = (eventId: string, attendeeCount: number): void => {
  ioInstance?.to(getEventRoomName(eventId)).emit(SOCKET_EVENTS.RSVP_UPDATED, {
    eventId,
    attendeeCount,
  });
};

export const emitMessageCreated = (eventId: string, message: MessageResponseDto): void => {
  ioInstance?.to(getEventRoomName(eventId)).emit(SOCKET_EVENTS.MESSAGE_CREATED, {
    eventId,
    message,
  });
};
