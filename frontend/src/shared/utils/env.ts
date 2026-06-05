const getEnvValue = (key: 'VITE_API_BASE_URL' | 'VITE_SOCKET_URL', fallback: string): string => {
  return import.meta.env[key] ?? fallback;
};

export const env = {
  apiBaseUrl: getEnvValue('VITE_API_BASE_URL', 'http://localhost:5000/api'),
  socketUrl: getEnvValue('VITE_SOCKET_URL', 'http://localhost:5000'),
} as const;
