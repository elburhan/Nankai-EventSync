import type { UserRole } from '../../shared/constants/user-role';

export interface AuthenticatedUserDto {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponseDto {
  token: string;
  user: AuthenticatedUserDto;
}

export interface RegistrationVerificationDto {
  email: string;
  requiresEmailVerification: true;
  verificationExpiresAt: Date;
  debugVerificationCode?: string;
}

export interface VerifyEmailResponseDto {
  email: string;
  emailVerified: true;
}

export interface ResendVerificationResponseDto {
  email: string;
  requiresEmailVerification: true;
  verificationExpiresAt: Date;
  debugVerificationCode?: string;
}

export interface DeleteAccountResponseDto {
  deletedUserId: string;
  deletedOwnedEventCount: number;
  deletedRsvpCount: number;
  deletedMessageCount: number;
}
