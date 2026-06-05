import type { Request, Response } from 'express';

import { HTTP_STATUS } from '../../shared/constants/http-status';

export const notFoundHandler = (request: Request, response: Response): void => {
  response.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${request.method} ${request.originalUrl}`,
  });
};
