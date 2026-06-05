import { z } from 'zod';

import { objectIdSchema } from './object-id.validator';

export const eventRsvpParamsSchema = z.object({
  params: z.object({
    eventId: objectIdSchema,
  }),
});
