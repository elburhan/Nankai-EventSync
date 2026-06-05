import { Router } from 'express';

import { healthController } from '../controllers/health.controller';
import { asyncHandler } from '../middlewares/async-handler.middleware';

const healthRouter = Router();

healthRouter.get('/health', asyncHandler(async (_request, response) => {
  healthController.getHealth(_request, response);
}));

export { healthRouter };
