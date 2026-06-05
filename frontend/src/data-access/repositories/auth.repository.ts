import type { AxiosError } from 'axios';

import { httpClient } from '../../integration/api/http-client';
import type { ApiErrorResponse, ApiResponse } from '../../shared/types/api';
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

const extractErrorMessage = (error: unknown): string => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message ?? 'Something went wrong. Please try again.';
};

export const authRepository = {
  async register(values: RegisterFormValues): Promise<RegistrationVerificationPayload> {
    try {
      const response = await httpClient.post<ApiResponse<RegistrationVerificationPayload>>('/auth/register', values);
      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  async login(values: LoginFormValues): Promise<AuthPayload> {
    try {
      const response = await httpClient.post<ApiResponse<AuthPayload>>('/auth/login', values);
      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  async deleteCurrentUser(): Promise<DeleteAccountSummary> {
    try {
      const response = await httpClient.delete<ApiResponse<DeleteAccountSummary>>('/auth/me');
      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  async verifyEmail(values: VerifyEmailFormValues): Promise<VerifyEmailResponse> {
    try {
      const response = await httpClient.post<ApiResponse<VerifyEmailResponse>>('/auth/verify-email', values);
      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  async resendVerification(email: string): Promise<ResendVerificationPayload> {
    try {
      const response = await httpClient.post<ApiResponse<ResendVerificationPayload>>('/auth/resend-verification', {
        email,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
};
