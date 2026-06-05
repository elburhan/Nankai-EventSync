export type UserRole = 'student' | 'organizer' | 'admin';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  token: string;
  user: AuthUser;
}

export interface DeleteAccountSummary {
  deletedUserId: string;
  deletedOwnedEventCount: number;
  deletedRsvpCount: number;
  deletedMessageCount: number;
}

export interface RegistrationVerificationPayload {
  email: string;
  requiresEmailVerification: true;
  verificationExpiresAt: string;
  debugVerificationCode?: string;
}

export interface ResendVerificationPayload {
  email: string;
  requiresEmailVerification: true;
  verificationExpiresAt: string;
  debugVerificationCode?: string;
}

export interface VerifyEmailResponse {
  email: string;
  emailVerified: true;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues extends LoginFormValues {
  fullName: string;
  role: Extract<UserRole, 'student' | 'organizer'>;
  confirmPassword: string;
}

export interface VerifyEmailFormValues {
  email: string;
  code: string;
}
