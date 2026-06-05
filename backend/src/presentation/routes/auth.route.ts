import { Router } from 'express';

import { authController } from '../controllers/auth.controller';
import { asyncHandler } from '../middlewares/async-handler.middleware';
import { requireAuthentication } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import {
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from '../../business/validators/auth.validator';

const authRouter = Router();

authRouter.post('/auth/register', validateRequest(registerSchema), asyncHandler((request, response) => {
  return authController.register(request, response);
}));

authRouter.post('/auth/login', validateRequest(loginSchema), asyncHandler((request, response) => {
  return authController.login(request, response);
}));

authRouter.post('/auth/verify-email', validateRequest(verifyEmailSchema), asyncHandler((request, response) => {
  return authController.verifyEmail(request, response);
}));

authRouter.post('/auth/resend-verification', validateRequest(resendVerificationSchema), asyncHandler((request, response) => {
  return authController.resendVerification(request, response);
}));

authRouter.delete('/auth/me', requireAuthentication, asyncHandler((request, response) => {
  return authController.deleteCurrentUser(request, response);
}));

export { authRouter };
