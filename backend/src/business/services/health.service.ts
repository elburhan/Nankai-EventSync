import type { HealthResponseDto } from '../dto/health-response.dto';

interface BuildHealthResponseOptions {
  environment: string;
  timestamp: string;
  uptimeInSeconds: number;
}

import mongoose from 'mongoose';

export class HealthService {
  private getDatabaseStatus(): string {
    const state = mongoose.connection.readyState;
    switch (state) {
      case 0: return 'disconnected';
      case 1: return 'connected';
      case 2: return 'connecting';
      case 3: return 'disconnecting';
      default: return 'unknown';
    }
  }

  public async buildHealthResponse(options: BuildHealthResponseOptions): Promise<HealthResponseDto> {
    const dbStatus = this.getDatabaseStatus();

    return {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      message: dbStatus === 'connected' ? 'EventSync backend is healthy.' : 'EventSync backend is experiencing database connectivity issues.',
      timestamp: options.timestamp,
      environment: options.environment,
      uptimeInSeconds: options.uptimeInSeconds,
      database: dbStatus,
    };
  }
}
