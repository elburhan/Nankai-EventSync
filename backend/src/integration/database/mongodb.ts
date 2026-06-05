import mongoose from 'mongoose';

import { env } from '../config/env';
import { logger } from '../../shared/utils/logger';

export const connectToDatabase = async (): Promise<void> => {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGODB_URI);
  logger.info(`MongoDB connected successfully: ${mongoose.connection.name}`);
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  logger.info('MongoDB connection closed.');
};
