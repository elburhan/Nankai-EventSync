import { STORAGE_KEYS } from '../../shared/constants/storage-key';

export const tokenStorage = {
  getToken(): string | null {
    return window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
  setToken(token: string): void {
    window.localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },
  clearToken(): void {
    window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },
};
