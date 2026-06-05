import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

export const validateRequest = (schema: ZodTypeAny) => {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const parsed = schema.parse({
      body: request.body,
      params: request.params,
      query: request.query,
    }) as {
      body?: unknown;
      params?: unknown;
      query?: unknown;
    };

    if (parsed.body) {
      request.body = parsed.body;
    }

    if (parsed.params) {
      request.params = parsed.params as Request['params'];
    }

    if (parsed.query) {
      request.query = parsed.query as Request['query'];
    }

    next();
  };
};
