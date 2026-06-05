import { config as loadEnvironment } from 'dotenv';
import { z } from 'zod';

loadEnvironment();

const isValidHttpsOrigin = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().trim().default('/api'),
  FRONTEND_ORIGIN: z
    .string()
    .trim()
    .min(1, 'FRONTEND_ORIGIN must not be empty.')
    .refine(
      (value) => {
        // In production, reject wildcards and ensure each origin is a valid URL.
        if (process.env.NODE_ENV === 'production') {
          if (value === '*') {
            return false;
          }
          const origins = value.split(',').map((o) => o.trim()).filter(Boolean);
          return origins.every(isValidHttpsOrigin);
        }
        return true;
      },
      {
        message:
          'In production, FRONTEND_ORIGIN must be a comma-separated list of valid https:// URLs. Wildcards (*) are not allowed.',
      },
    ),
  MONGODB_URI: z.string().trim().min(1),
  JWT_SECRET: z.string().trim().min(32, 'JWT_SECRET must be at least 32 characters long.'),
  JWT_EXPIRES_IN: z.string().trim().default('7d'),
  CLOUDINARY_CLOUD_NAME: z.string().trim().optional(),
  CLOUDINARY_API_KEY: z.string().trim().optional(),
  CLOUDINARY_API_SECRET: z.string().trim().optional(),
  POSTER_UPLOAD_FOLDER: z.string().trim().default('eventsync/events'),
  SMTP_HOST: z.string().trim().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .string()
    .trim()
    .optional()
    .transform((value) => value === 'true'),
  SMTP_USER: z.string().trim().optional(),
  SMTP_PASS: z.string().trim().optional(),
  SMTP_FROM_EMAIL: z.string().trim().email().default('no-reply@eventsync.local'),
  GROQ_API_KEY: z.string().trim().optional(),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const formattedErrors = parsedEnvironment.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  throw new Error(`Invalid environment configuration: ${formattedErrors}`);
}

const origins = parsedEnvironment.data.FRONTEND_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  ...parsedEnvironment.data,
  FRONTEND_ORIGINS: origins,
} as const;
