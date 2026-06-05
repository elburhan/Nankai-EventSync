import type { Request, Response } from 'express';

import { HealthService } from '../../business/services/health.service';
import { env } from '../../integration/config/env';
import { HTTP_STATUS } from '../../shared/constants/http-status';
import { getIsoTimestamp } from '../../shared/utils/date';

const healthService = new HealthService();

export class HealthController {
  public async getHealth(_request: Request, response: Response): Promise<void> {
    const payload = await healthService.buildHealthResponse({
      environment: env.NODE_ENV,
      timestamp: getIsoTimestamp(),
      uptimeInSeconds: Number(process.uptime().toFixed(2)),
    });

    response.status(HTTP_STATUS.OK).json({
      success: true,
      data: payload,
    });
  }
}

export const healthController = new HealthController();
