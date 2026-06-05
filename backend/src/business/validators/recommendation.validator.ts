import { z } from 'zod';

export const recommendationRequestSchema = z.object({
  body: z.object({
    limit: z.coerce.number().int().min(1).max(6).default(4),
  }).default({}),
});

export const homeFeedQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(8).default(6),
  }),
});
