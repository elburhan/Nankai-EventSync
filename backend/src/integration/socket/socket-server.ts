import type { Server as HttpServer } from 'http';

import { Server, type Socket } from 'socket.io';

import { EventRoomService } from '../../business/services/event-room.service';
import { MessageService } from '../../business/services/message.service';
import {
  joinEventRoomSchema,
  leaveEventRoomSchema,
  sendMessageSchema,
} from '../../business/validators/message.validator';
import { JwtService } from '../auth/jwt.service';
import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import { getEventRoomName, SOCKET_EVENTS } from '../../shared/constants/socket-event';
import type { AuthenticatedUser } from '../../shared/types/auth';
import { logger } from '../../shared/utils/logger';
import { setSocketServerInstance } from './socket-emitter';

export let io: Server | null = null;
const userSocketIds = new Map<string, Set<string>>();

const jwtService = new JwtService();
const eventRoomService = new EventRoomService();
const messageService = new MessageService();

interface AuthenticatedSocket extends Socket {
  data: Socket['data'] & {
    authenticatedUser: AuthenticatedUser;
    joinedEventIds: Set<string>;
  };
}

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

type SocketAck<TPayload> = (response: SocketAckSuccess<TPayload> | SocketAckError) => void;

const extractHandshakeToken = (socket: Socket): string | null => {
  const authToken =
    typeof socket.handshake.auth.token === 'string' ? socket.handshake.auth.token : null;

  if (authToken) {
    return authToken.startsWith('Bearer ') ? authToken.slice(7) : authToken;
  }

  const authorizationHeader = socket.handshake.headers.authorization;

  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

const emitSocketError = (socket: Socket, error: unknown): void => {
  const appError = error instanceof AppError
    ? error
    : new AppError('An unexpected socket error occurred.', HTTP_STATUS.INTERNAL_SERVER_ERROR);

  socket.emit(SOCKET_EVENTS.ERROR, {
    message: appError.message,
    statusCode: appError.statusCode,
  });
};

const toAppError = (error: unknown): AppError => {
  return error instanceof AppError
    ? error
    : new AppError('An unexpected socket error occurred.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
};

const joinSocketToEventRoom = (socket: AuthenticatedSocket, eventId: string): void => {
  const roomName = getEventRoomName(eventId);

  socket.join(roomName);
  socket.data.joinedEventIds.add(eventId);
};

const registerEventHandlers = (socket: AuthenticatedSocket): void => {
  socket.on(SOCKET_EVENTS.EVENT_JOIN, async (payload: unknown) => {
    try {
      const { eventId } = joinEventRoomSchema.parse(payload);
      const roomState = await eventRoomService.getRoomState(socket.data.authenticatedUser, eventId);
      const roomName = getEventRoomName(eventId);

      joinSocketToEventRoom(socket, eventId);

      socket.emit(SOCKET_EVENTS.EVENT_JOINED, roomState);
      logger.info(`Socket ${socket.id} joined room ${roomName}`);
    } catch (error) {
      emitSocketError(socket, error);
    }
  });

  socket.on(SOCKET_EVENTS.EVENT_LEAVE, (payload: unknown) => {
    try {
      const { eventId } = leaveEventRoomSchema.parse(payload);
      const roomName = getEventRoomName(eventId);

      socket.leave(roomName);
      socket.data.joinedEventIds.delete(eventId);

      socket.emit(SOCKET_EVENTS.EVENT_LEFT, { eventId });
      logger.info(`Socket ${socket.id} left room ${roomName}`);
    } catch (error) {
      emitSocketError(socket, error);
    }
  });

  socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (payload: unknown, ack?: SocketAck<{ eventId: string }>) => {
    try {
      const parsedPayload = sendMessageSchema.parse(payload);
      await eventRoomService.assertChatAccess(socket.data.authenticatedUser, parsedPayload.eventId);
      joinSocketToEventRoom(socket, parsedPayload.eventId);
      const message = await messageService.createRoomMessage(socket.data.authenticatedUser, parsedPayload);

      ack?.({
        ok: true,
        payload: {
          eventId: message.eventId,
        },
      });
    } catch (error) {
      const appError = toAppError(error);
      emitSocketError(socket, appError);
      ack?.({
        ok: false,
        error: {
          message: appError.message,
          statusCode: appError.statusCode,
        },
      });
    }
  });

  socket.on('disconnect', (reason) => {
    const userId = socket.data.authenticatedUser.id;
    const activeSocketIds = userSocketIds.get(userId);

    if (activeSocketIds) {
      activeSocketIds.delete(socket.id);

      if (activeSocketIds.size === 0) {
        userSocketIds.delete(userId);
      }
    }

    const joinedRooms = Array.from(socket.data.joinedEventIds.values()).join(', ') || 'none';
    logger.info(`Socket disconnected: ${socket.id} (${reason}). Joined rooms before disconnect: ${joinedRooms}`);
  });
};

export const disconnectSocketsForUser = (userId: string): void => {
  const socketIds = userSocketIds.get(userId);

  if (!socketIds || !io) {
    return;
  }

  for (const socketId of socketIds.values()) {
    const socket = io.sockets.sockets.get(socketId) as AuthenticatedSocket | undefined;

    if (!socket) {
      continue;
    }

    for (const eventId of socket.data.joinedEventIds.values()) {
      socket.leave(getEventRoomName(eventId));
    }

    socket.disconnect(true);
  }

  userSocketIds.delete(userId);
  logger.info(`Disconnected active sockets for deleted user ${userId}.`);
};

export const initializeSocketServer = (
  httpServer: HttpServer,
  allowedOrigins: string[],
): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  setSocketServerInstance(io);

  io.use((socket, next) => {
    const token = extractHandshakeToken(socket);

    if (!token) {
      next(new AppError('Socket authentication token is required.', HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    try {
      const payload = jwtService.verifyToken(token);
      const authenticatedSocket = socket as AuthenticatedSocket;

      authenticatedSocket.data.authenticatedUser = {
        id: payload.sub,
        role: payload.role,
      };
      authenticatedSocket.data.joinedEventIds = new Set<string>();

      next();
    } catch {
      next(new AppError('Invalid or expired socket authentication token.', HTTP_STATUS.UNAUTHORIZED));
    }
  });

  io.on('connection', (socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket;
    const userId = authenticatedSocket.data.authenticatedUser.id;
    const existingSocketIds = userSocketIds.get(userId) ?? new Set<string>();

    existingSocketIds.add(socket.id);
    userSocketIds.set(userId, existingSocketIds);

    logger.info(
      `Socket connected: ${socket.id} for user ${userId}`,
    );

    registerEventHandlers(authenticatedSocket);
  });

  logger.info('Socket.io server initialized.');
  return io;
};
