import { Router } from 'express';

import { eventController } from '../controllers/event.controller';
import { asyncHandler } from '../middlewares/async-handler.middleware';
import { optionalAuthentication, requireAuthentication, requireRole } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import {
  calendarEventsSchema,
  createEventSchema,
  eventIdParamsSchema,
  listEventsSchema,
  updateEventStatusSchema,
  updateEventSchema,
} from '../../business/validators/event.validator';

const eventRouter = Router();

eventRouter.get('/events', optionalAuthentication, validateRequest(listEventsSchema), asyncHandler((request, response) => {
  return eventController.getEvents(request, response);
}));

eventRouter.get('/calendar-events', optionalAuthentication, validateRequest(calendarEventsSchema), asyncHandler((request, response) => {
  return eventController.getCalendarEvents(request, response);
}));

eventRouter.get('/events/:eventId', validateRequest(eventIdParamsSchema), asyncHandler((request, response) => {
  return eventController.getEventById(request, response);
}));

eventRouter.post(
  '/events',
  requireAuthentication,
  requireRole('organizer', 'admin'),
  validateRequest(createEventSchema),
  asyncHandler((request, response) => {
    return eventController.createEvent(request, response);
  }),
);

eventRouter.patch(
  '/events/:eventId',
  requireAuthentication,
  requireRole('organizer', 'admin'),
  validateRequest(updateEventSchema),
  asyncHandler((request, response) => {
    return eventController.updateEvent(request, response);
  }),
);

eventRouter.patch(
  '/events/:eventId/status',
  requireAuthentication,
  requireRole('organizer', 'admin'),
  validateRequest(updateEventStatusSchema),
  asyncHandler((request, response) => {
    return eventController.updateEventStatus(request, response);
  }),
);

eventRouter.delete(
  '/events/:eventId',
  requireAuthentication,
  requireRole('organizer', 'admin'),
  validateRequest(eventIdParamsSchema),
  asyncHandler((request, response) => {
    return eventController.deleteEvent(request, response);
  }),
);

export { eventRouter };
