import axios from 'axios';

import { env } from '../../shared/utils/env';
import { tokenStorage } from '../storage/token-storage';

let handleUnauthorized: (() => void) | null = null;

export const registerUnauthorizedHandler = (handler: (() => void) | null): void => {
  handleUnauthorized = handler;
};

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
});

export const publicHttpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
});

httpClient.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handleUnauthorized?.();
    }

    return Promise.reject(error);
  },
);
