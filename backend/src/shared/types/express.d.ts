import type { UserRole } from '../constants/user-role';

declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

export {};
