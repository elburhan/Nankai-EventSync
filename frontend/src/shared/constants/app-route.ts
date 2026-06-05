export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  EVENTS: '/events',
  CREATE_EVENT: '/events/new',
  EDIT_EVENT: '/events/:eventId/edit',
  EVENT_DETAIL: '/events/:eventId',
} as const;

export const getEventDetailRoute = (eventId: string): string => `/events/${eventId}`;
export const getEditEventRoute = (eventId: string): string => `/events/${eventId}/edit`;
