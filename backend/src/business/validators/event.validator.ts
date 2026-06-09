import { z } from 'zod';

import { EVENT_CATEGORIES } from '../../shared/constants/event-category';
import { EVENT_LIST_MAX_LIMIT } from '../../shared/constants/event-limit';
import { EVENT_STATUSES } from '../../shared/constants/event-status';
import { objectIdSchema } from './object-id.validator';

const posterSourceSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://'),
    'Poster must be a valid image data URI or remote URL.',
  );

const tagsSchema = z.array(z.string().trim().min(1).max(40)).max(10).default([]);

export const createEventSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(3).max(150),
      description: z.string().trim().min(10).max(5000),
      category: z.enum(EVENT_CATEGORIES),
      location: z.string().trim().min(2).max(200),
      timezone: z.string().trim().min(2).max(100).default('Asia/Shanghai'),
      startAt: z.coerce.date(),
      endAt: z.coerce.date(),
      capacity: z.coerce.number().int().positive().optional(),
      tags: tagsSchema.optional(),
      status: z.enum(EVENT_STATUSES).default('published'),
      posterDataUri: posterSourceSchema.optional(),
    })
    .refine((value) => value.endAt > value.startAt, 'Event end time must be after start time.'),
});

export const updateEventSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(3).max(150).optional(),
      description: z.string().trim().min(10).max(5000).optional(),
      category: z.enum(EVENT_CATEGORIES).optional(),
      location: z.string().trim().min(2).max(200).optional(),
      timezone: z.string().trim().min(2).max(100).optional(),
      startAt: z.coerce.date().optional(),
      endAt: z.coerce.date().optional(),
      capacity: z.coerce.number().int().positive().optional(),
      tags: tagsSchema.optional(),
      status: z.enum(EVENT_STATUSES).optional(),
      posterDataUri: posterSourceSchema.optional(),
      removePoster: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided for update.')
    .refine(
      (value) => {
        if (value.startAt && value.endAt) {
          return value.endAt > value.startAt;
        }

        return true;
      },
      'Event end time must be after start time.',
    ),
  params: z.object({
    eventId: objectIdSchema,
  }),
});

export const eventIdParamsSchema = z.object({
  params: z.object({
    eventId: objectIdSchema,
  }),
});

export const updateEventStatusSchema = z.object({
  body: z.object({
    status: z.enum(EVENT_STATUSES),
  }),
  params: z.object({
    eventId: objectIdSchema,
  }),
});

export const listEventsSchema = z.object({
  query: z.object({
    q: z.string().trim().min(1).optional(),
    category: z.enum(EVENT_CATEGORIES).optional(),
    status: z.enum(EVENT_STATUSES).optional(),
    organizerId: objectIdSchema.optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    upcoming: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((value) => {
        if (typeof value === 'boolean' || value === undefined) {
          return value;
        }

        return value === 'true';
      }),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(EVENT_LIST_MAX_LIMIT).default(10),
  }),
});

export const calendarEventsSchema = z.object({
  query: z.object({
    q: z.string().trim().min(1).optional(),
    status: z.enum(EVENT_STATUSES).optional(),
    organizerId: objectIdSchema.optional(),
    from: z.string().datetime(),
    to: z.string().datetime(),
  }).refine(
    (value) => new Date(value.to).getTime() >= new Date(value.from).getTime(),
    'Calendar end date must be after the start date.',
  ),
});
