import { io, type Socket } from 'socket.io-client';

import { SOCKET_EVENTS } from '../../shared/constants/socket-event';
import { env } from '../../shared/utils/env';

let socket: Socket | null = null;
let currentToken: string | null = null;
const joinedEventIds = new Set<string>();

interface SocketAckSuccess<TPayload> {
  ok: true;
  payload: TPayload;
}

interface SocketAckError {
  ok: false;
  error: {
    message: string;
    statusCode: number;
  };
}

type SocketAck<TPayload> = SocketAckSuccess<TPayload> | SocketAckError;

const emitJoinedRooms = (): void => {
  if (!socket?.connected) {
    return;
  }

  for (const eventId of joinedEventIds.values()) {
    socket.emit(SOCKET_EVENTS.EVENT_JOIN, { eventId });
  }
};

const initializeSocket = (): Socket => {
  const nextSocket = io(env.socketUrl, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ['websocket'],
  });

  nextSocket.on('connect', () => {
    emitJoinedRooms();
  });

  return nextSocket;
};

export const socketClient = {
  connect(token: string): Socket {
    if (!socket) {
      socket = initializeSocket();
    }

    currentToken = token;
    socket.auth = {
      token,
    };

    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  },
  getInstance(): Socket | null {
    return socket;
  },
  ensureConnected(token: string): Socket {
    return this.connect(token);
  },
  disconnect(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    currentToken = null;
    joinedEventIds.clear();
  },
  joinEventRoom(eventId: string): void {
    joinedEventIds.add(eventId);

    if (!socket) {
      return;
    }

    if (!socket.connected && currentToken) {
      this.connect(currentToken);
    }

    socket.emit(SOCKET_EVENTS.EVENT_JOIN, { eventId });
  },
  leaveEventRoom(eventId: string): void {
    joinedEventIds.delete(eventId);
    socket?.emit(SOCKET_EVENTS.EVENT_LEAVE, { eventId });
  },
  async sendMessage(eventId: string, body: string): Promise<void> {
    if (!socket) {
      throw new Error('Live chat is not connected right now.');
    }

    joinedEventIds.add(eventId);

    if (!socket.connected && currentToken) {
      this.connect(currentToken);
    }

    socket.emit(SOCKET_EVENTS.EVENT_JOIN, { eventId });

    await new Promise<void>((resolve, reject) => {
      socket?.emit(
        SOCKET_EVENTS.MESSAGE_SEND,
        { eventId, body },
        (response: SocketAck<{ eventId: string }>) => {
          if (!response) {
            reject(new Error('Message delivery was not acknowledged.'));
            return;
          }

          if (!response.ok) {
            reject(new Error(response.error.message));
            return;
          }

          resolve();
        },
      );
    });
  },
};
