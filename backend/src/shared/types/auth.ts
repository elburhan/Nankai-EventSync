import type { UserRole } from '../constants/user-role';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

export interface JwtPayload {
  sub: string;
  role: UserRole;
}
