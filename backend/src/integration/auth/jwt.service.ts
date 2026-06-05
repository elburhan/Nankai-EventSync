import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import type { AuthenticatedUser, JwtPayload } from '../../shared/types/auth';

export class JwtService {
  public signToken(user: AuthenticatedUser): string {
    return jwt.sign(
      {
        role: user.role,
      },
      env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      },
    );
  }

  public verifyToken(token: string): JwtPayload {
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;

    if (!payload.sub || typeof payload.sub !== 'string' || typeof payload.role !== 'string') {
      throw new Error('Invalid JWT payload.');
    }

    return {
      sub: payload.sub,
      role: payload.role as JwtPayload['role'],
    };
  }
}
