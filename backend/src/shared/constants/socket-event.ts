export const SOCKET_EVENTS = {
  CONNECT_ERROR: 'connect_error',
  ERROR: 'socket:error',
  EVENT_JOIN: 'event:join',
  EVENT_JOINED: 'event:joined',
  EVENT_LEAVE: 'event:leave',
  EVENT_LEFT: 'event:left',
  RSVP_UPDATED: 'event:rsvp-updated',
  MESSAGE_SEND: 'message:send',
  MESSAGE_CREATED: 'message:created',
} as const;

export const getEventRoomName = (eventId: string): string => `event:${eventId}`;
