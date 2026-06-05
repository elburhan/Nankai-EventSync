import { Router } from 'express';

import { authRouter } from './auth.route';
import { eventRouter } from './event.route';
import { healthRouter } from './health.route';
import { recommendationRouter } from './recommendation.route';
import { rsvpRouter } from './rsvp.route';

const apiRouter = Router();

apiRouter.use(authRouter);
apiRouter.use(eventRouter);
apiRouter.use(healthRouter);
apiRouter.use(recommendationRouter);
apiRouter.use(rsvpRouter);

export { apiRouter };
