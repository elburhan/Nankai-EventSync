import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

export const registerSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters long.'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters long.'),
  role: z.enum(['student', 'organizer']),
}).refine((value) => value.password === value.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit verification code.'),
});
