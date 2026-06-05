import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

import { AppError } from '../../shared/errors/app-error';
import { HTTP_STATUS } from '../../shared/constants/http-status';
import { env } from '../../integration/config/env';
import { logger } from '../../shared/utils/logger';

export const errorHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction,
): void => {
  void next;

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details ?? null,
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed.',
      details: error.flatten(),
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    response.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Database validation failed.',
      details: error.errors,
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    response.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Invalid resource identifier.',
      details: {
        path: error.path,
        value: error.value,
      },
    });
    return;
  }

  const duplicateKeyError = error as { code?: number; keyPattern?: unknown };

  if (duplicateKeyError.code === 11000) {
    response.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'A unique resource conflict occurred.',
      details: duplicateKeyError.keyPattern ?? null,
    });
    return;
  }

  logger.error({ err: error }, 'Unhandled application error.');

  response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'An unexpected error occurred.',
    details: env.NODE_ENV === 'development' ? error : null,
  });
};
