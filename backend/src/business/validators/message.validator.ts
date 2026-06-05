import { z } from 'zod';

import { objectIdSchema } from './object-id.validator';

export const joinEventRoomSchema = z.object({
  eventId: objectIdSchema,
});

export const leaveEventRoomSchema = z.object({
  eventId: objectIdSchema,
});

export const sendMessageSchema = z.object({
  eventId: objectIdSchema,
  body: z.string().trim().min(1).max(2000),
});
