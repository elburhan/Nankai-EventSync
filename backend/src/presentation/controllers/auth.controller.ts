import type { Request, Response } from 'express';

import { AuthService } from '../../business/services/auth.service';
import { UserService } from '../../business/services/user.service';
import { HTTP_STATUS } from '../../shared/constants/http-status';

const authService = new AuthService();
const userService = new UserService();

export class AuthController {
  public async register(request: Request, response: Response): Promise<void> {
    const authResponse = await authService.register(request.body);

    response.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: authResponse,
    });
  }

  public async login(request: Request, response: Response): Promise<void> {
    const authResponse = await authService.login(request.body);

    response.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User logged in successfully.',
      data: authResponse,
    });
  }

  public async verifyEmail(request: Request, response: Response): Promise<void> {
    const verificationResponse = await authService.verifyEmail(request.body);

    response.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Email verified successfully.',
      data: verificationResponse,
    });
  }

  public async resendVerification(request: Request, response: Response): Promise<void> {
    const resendResponse = await authService.resendVerificationEmail(request.body.email);

    response.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Verification email resent successfully.',
      data: resendResponse,
    });
  }

  public async deleteCurrentUser(request: Request, response: Response): Promise<void> {
    const authenticatedUser = request.authenticatedUser;

    if (!authenticatedUser) {
      response.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication is required.',
      });
      return;
    }

    const deletionSummary = await userService.deleteAuthenticatedUser(authenticatedUser);

    response.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User account deleted successfully.',
      data: deletionSummary,
    });
  }
}

export const authController = new AuthController();
