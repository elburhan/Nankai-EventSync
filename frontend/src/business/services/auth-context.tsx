import {
  createContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import { registerUnauthorizedHandler } from '../../integration/api/http-client';
import type {
  AuthPayload,
  AuthUser,
  DeleteAccountSummary,
  LoginFormValues,
  RegisterFormValues,
  ResendVerificationPayload,
  RegistrationVerificationPayload,
  VerifyEmailFormValues,
  VerifyEmailResponse,
} from '../../shared/types/auth';
import { authSessionService } from './auth-session.service';

interface AuthContextValue {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  user: AuthUser | null;
  token: string | null;
  login: (values: LoginFormValues) => Promise<void>;
  register: (values: RegisterFormValues) => Promise<RegistrationVerificationPayload>;
  verifyEmail: (values: VerifyEmailFormValues) => Promise<VerifyEmailResponse>;
  resendVerification: (email: string) => Promise<ResendVerificationPayload>;
  deleteAccount: () => Promise<DeleteAccountSummary>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const buildFallbackUser = (token: string): AuthUser => {
  const payloadPart = token.split('.')[1];

  try {
    const decoded = JSON.parse(window.atob(payloadPart)) as { sub?: string; role?: AuthUser['role'] };

    return {
      id: decoded.sub ?? '',
      fullName: 'Authenticated User',
      email: 'session@eventsync.local',
      role: decoded.role ?? 'student',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return {
      id: '',
      fullName: 'Authenticated User',
      email: 'session@eventsync.local',
      role: 'student',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const applyAuthPayload = (payload: AuthPayload): void => {
    setToken(payload.token);
    setUser(payload.user);
  };

  const logout = (): void => {
    authSessionService.logout();
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const storedToken = authSessionService.getStoredToken();

    if (storedToken) {
      authSessionService.restoreSession(storedToken);
      setToken(storedToken);
      setUser(buildFallbackUser(storedToken));
    }

    setIsBootstrapping(false);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(logout);

    return () => {
      registerUnauthorizedHandler(null);
    };
  }, []);

  const value: AuthContextValue = {
    isAuthenticated: Boolean(token),
    isBootstrapping,
    user,
    token,
    async login(values: LoginFormValues) {
      const payload = await authSessionService.login(values);
      applyAuthPayload(payload);
    },
    async register(values: RegisterFormValues) {
      return authSessionService.register(values);
    },
    async verifyEmail(values: VerifyEmailFormValues) {
      return authSessionService.verifyEmail(values);
    },
    async resendVerification(email: string) {
      return authSessionService.resendVerification(email);
    },
    async deleteAccount() {
      const summary = await authSessionService.deleteAccount();
      setToken(null);
      setUser(null);
      return summary;
    },
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
