export interface HealthResponseDto {
  status: 'ok' | 'degraded';
  message: string;
  timestamp: string;
  environment: string;
  uptimeInSeconds: number;
  database: string;
}
