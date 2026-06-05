import { Router } from 'express';

import { rsvpController } from '../controllers/rsvp.controller';
import { asyncHandler } from '../middlewares/async-handler.middleware';
import { requireAuthentication } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { eventRsvpParamsSchema } from '../../business/validators/rsvp.validator';

const rsvpRouter = Router();

rsvpRouter.post(
  '/events/:eventId/rsvp',
  requireAuthentication,
  validateRequest(eventRsvpParamsSchema),
  asyncHandler((request, response) => {
    return rsvpController.createRsvp(request, response);
  }),
);

rsvpRouter.delete(
  '/events/:eventId/rsvp',
  requireAuthentication,
  validateRequest(eventRsvpParamsSchema),
  asyncHandler((request, response) => {
    return rsvpController.cancelRsvp(request, response);
  }),
);

export { rsvpRouter };
