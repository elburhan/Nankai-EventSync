import pinoHttp from 'pino-http';
import { logger } from '../../shared/utils/logger';

export const requestLogger = pinoHttp({
  logger,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.token',
      'body.passwordHash',
      'res.headers["set-cookie"]'
    ],
    censor: '[REDACTED]',
  },
  autoLogging: {
    ignore: (req) => {
      if (req.url === '/api/health') {
        return true;
      }
      return false;
    }
  }
});
