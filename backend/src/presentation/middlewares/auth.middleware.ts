import type { NextFunction, Request, Response } from 'express';

import { JwtService } from '../../integration/auth/jwt.service';
import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import { USER_ROLES, type UserRole } from '../../shared/constants/user-role';

const jwtService = new JwtService();

const extractBearerToken = (request: Request): string | null => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

export const requireAuthentication = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  const token = extractBearerToken(request);

  if (!token) {
    next(new AppError('Authentication token is required.', HTTP_STATUS.UNAUTHORIZED));
    return;
  }

  try {
    const payload = jwtService.verifyToken(token);

    request.authenticatedUser = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    next(new AppError('Invalid or expired authentication token.', HTTP_STATUS.UNAUTHORIZED));
  }
};

export const optionalAuthentication = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  const token = extractBearerToken(request);

  if (!token) {
    next();
    return;
  }

  try {
    const payload = jwtService.verifyToken(token);

    request.authenticatedUser = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    next(new AppError('Invalid or expired authentication token.', HTTP_STATUS.UNAUTHORIZED));
  }
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const user = request.authenticatedUser;

    if (!user) {
      next(new AppError('Authentication is required.', HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const isAllowedRole = allowedRoles.includes(user.role) && USER_ROLES.includes(user.role);

    if (!isAllowedRole) {
      next(new AppError('You do not have permission to perform this action.', HTTP_STATUS.FORBIDDEN));
      return;
    }

    next();
  };
};
