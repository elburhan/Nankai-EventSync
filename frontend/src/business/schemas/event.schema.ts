import { z } from 'zod';
import { EVENT_CATEGORIES } from '../../shared/constants/event-category';

const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const isFileInstance = (value: unknown): value is File => {
  if (typeof File === 'undefined') {
    return false;
  }

  return value instanceof File;
};

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters long.').max(150),
    description: z.string().trim().min(10, 'Description must be at least 10 characters long.').max(5000),
    category: z.enum(EVENT_CATEGORIES, {
      errorMap: () => ({
        message: 'Choose one of the approved event categories.',
      }),
    }),
    location: z.string().trim().min(2, 'Location must be at least 2 characters long.').max(200),
    timezone: z.string().trim().min(2, 'Timezone is required.').max(100),
    startAt: z.string().trim().min(1, 'Start date and time are required.'),
    endAt: z.string().trim().min(1, 'End date and time are required.'),
    capacity: z.string().trim().default(''),
    tags: z.string().trim().default(''),
    status: z.enum(['draft', 'published', 'cancelled', 'completed']),
    posterFile: z
      .custom<File | null>((value) => value === null || isFileInstance(value), 'Select a valid image file.')
      .refine((file) => file === null || acceptedImageTypes.includes(file.type), 'Poster must be a JPG, PNG, WEBP, or GIF image.')
      .refine((file) => file === null || file.size <= 5 * 1024 * 1024, 'Poster image must be 5 MB or smaller.'),
    posterUrl: z.string().trim().url().optional(),
    removePoster: z.boolean(),
  })
  .superRefine((values, context) => {
    const startAt = new Date(values.startAt);
    const endAt = new Date(values.endAt);

    if (Number.isNaN(startAt.getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startAt'],
        message: 'Enter a valid start date and time.',
      });
    }

    if (Number.isNaN(endAt.getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endAt'],
        message: 'Enter a valid end date and time.',
      });
    }

    if (!Number.isNaN(startAt.getTime()) && !Number.isNaN(endAt.getTime()) && endAt <= startAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endAt'],
        message: 'End date and time must be after the start date and time.',
      });
    }

    if (values.capacity) {
      const capacityValue = Number(values.capacity);

      if (!Number.isInteger(capacityValue) || capacityValue <= 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['capacity'],
          message: 'Capacity must be a positive whole number.',
        });
      }
    }
  });
