import http from 'http';
import dns from 'dns';

import { createApp } from './app';
import { env } from './integration/config/env';
import { connectToDatabase, disconnectFromDatabase } from './integration/database/mongodb';
import { emailService } from './integration/email/email-service';
import { initializeSocketServer } from './integration/socket/socket-server';
import { initializeCloudinary } from './integration/storage/cloudinary';
import { logger } from './shared/utils/logger';

const bootstrap = async (): Promise<void> => {
  // Configure DNS servers for MongoDB Atlas connectivity
  dns.setServers(['8.8.8.8', '1.1.1.1']);

  const app = createApp();
  const httpServer = http.createServer(app);

  initializeCloudinary();
  await emailService.verifyTransport();
  initializeSocketServer(httpServer, env.FRONTEND_ORIGINS);

  httpServer.listen(env.PORT, () => {
    logger.info(`EventSync backend server started on port ${env.PORT}.`);
    logger.info(`Health check available at http://localhost:${env.PORT}${env.API_PREFIX}/health`);
  });

  void connectToDatabase().catch((error: unknown) => {
    logger.error({ err: error }, 'MongoDB connection failed after HTTP server startup.');
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.warn(`Received ${signal}. Starting graceful shutdown.`);

    httpServer.close(async () => {
      await disconnectFromDatabase();
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
};

void bootstrap().catch((error: unknown) => {
  logger.error({ err: error }, 'Failed to bootstrap EventSync backend.');
  process.exit(1);
});
