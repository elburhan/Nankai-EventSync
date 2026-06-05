import { Router } from 'express';

import { recommendationController } from '../controllers/recommendation.controller';
import { asyncHandler } from '../middlewares/async-handler.middleware';
import { requireAuthentication } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { homeFeedQuerySchema, recommendationRequestSchema } from '../../business/validators/recommendation.validator';

const recommendationRouter = Router();

recommendationRouter.post(
  '/recommendations',
  requireAuthentication,
  validateRequest(recommendationRequestSchema),
  asyncHandler((request, response) => {
    return recommendationController.getRecommendations(request, response);
  }),
);

recommendationRouter.get(
  '/home-feed',
  requireAuthentication,
  validateRequest(homeFeedQuerySchema),
  asyncHandler((request, response) => {
    return recommendationController.getHomeFeed(request, response);
  }),
);

export { recommendationRouter };
