import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
    role: z.enum(['student', 'organizer']).default('student'),
    avatarUrl: z.string().trim().url().optional(),
    bio: z.string().trim().max(500).optional(),
  }).refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(128),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    code: z.string().trim().regex(/^\d{6}$/, 'Verification code must be 6 digits.'),
  }),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
  }),
});
