import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { env } from './integration/config/env';
import { apiRouter } from './presentation/routes';
import { errorHandler } from './presentation/middlewares/error-handler.middleware';
import { notFoundHandler } from './presentation/middlewares/not-found.middleware';
import { requestLogger } from './presentation/middlewares/request-logger.middleware';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(requestLogger);
  app.use(
    cors({
      origin: env.FRONTEND_ORIGINS,
      credentials: true,
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: 'Too many requests. Please try again later.',
      },
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(env.API_PREFIX, apiRouter);

  app.get('/', (_request, response) => {
    response.json({
      success: true,
      message: 'EventSync backend is running.',
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
