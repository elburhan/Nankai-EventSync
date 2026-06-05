import { authRepository } from '../../data-access/repositories/auth.repository';
import { socketRepository } from '../../data-access/repositories/socket.repository';
import { tokenStorage } from '../../integration/storage/token-storage';
import type {
  AuthPayload,
  DeleteAccountSummary,
  LoginFormValues,
  RegisterFormValues,
  ResendVerificationPayload,
  RegistrationVerificationPayload,
  VerifyEmailFormValues,
  VerifyEmailResponse,
} from '../../shared/types/auth';

export const authSessionService = {
  getStoredToken(): string | null {
    return tokenStorage.getToken();
  },
  async login(values: LoginFormValues): Promise<AuthPayload> {
    const payload = await authRepository.login(values);
    tokenStorage.setToken(payload.token);
    socketRepository.connect(payload.token);
    return payload;
  },
  async register(values: RegisterFormValues): Promise<RegistrationVerificationPayload> {
    return authRepository.register(values);
  },
  async verifyEmail(values: VerifyEmailFormValues): Promise<VerifyEmailResponse> {
    return authRepository.verifyEmail(values);
  },
  async resendVerification(email: string): Promise<ResendVerificationPayload> {
    return authRepository.resendVerification(email);
  },
  async deleteAccount(): Promise<DeleteAccountSummary> {
    const summary = await authRepository.deleteCurrentUser();
    this.logout();
    return summary;
  },
  restoreSession(token: string): void {
    tokenStorage.setToken(token);
    socketRepository.connect(token);
  },
  logout(): void {
    tokenStorage.clearToken();
    socketRepository.disconnect();
  },
};
