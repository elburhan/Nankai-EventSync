import { v2 as cloudinary } from 'cloudinary';

import { env } from '../config/env';
import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import { logger } from '../../shared/utils/logger';

export interface UploadedPosterAsset {
  secureUrl: string;
  publicId: string;
}

const isPlaceholderValue = (value?: string): boolean => {
  return (
    !value ||
    value.startsWith('your-') ||
    value.includes('your-cloudinary') ||
    value.includes('your-cloudinary-api')
  );
};

export const initializeCloudinary = (): void => {
  const hasCloudinaryCredentials =
    Boolean(env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(env.CLOUDINARY_API_KEY) &&
    Boolean(env.CLOUDINARY_API_SECRET) &&
    !isPlaceholderValue(env.CLOUDINARY_CLOUD_NAME) &&
    !isPlaceholderValue(env.CLOUDINARY_API_KEY) &&
    !isPlaceholderValue(env.CLOUDINARY_API_SECRET);

  if (!hasCloudinaryCredentials) {
    logger.warn('Cloudinary credentials are not fully configured yet. Uploads will remain disabled.');
    return;
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  logger.info('Cloudinary integration configured.');
};

const assertCloudinaryConfigured = (): void => {
  const hasCloudinaryCredentials =
    Boolean(env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(env.CLOUDINARY_API_KEY) &&
    Boolean(env.CLOUDINARY_API_SECRET) &&
    !isPlaceholderValue(env.CLOUDINARY_CLOUD_NAME) &&
    !isPlaceholderValue(env.CLOUDINARY_API_KEY) &&
    !isPlaceholderValue(env.CLOUDINARY_API_SECRET);

  if (!hasCloudinaryCredentials) {
    throw new AppError(
      'Cloudinary is not configured for poster uploads. Please set valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET values in the backend .env.',
      HTTP_STATUS.SERVICE_UNAVAILABLE,
    );
  }
};

export const uploadPosterAsset = async (source: string): Promise<UploadedPosterAsset> => {
  assertCloudinaryConfigured();

  try {
    const uploadResult = await cloudinary.uploader.upload(source, {
      folder: env.POSTER_UPLOAD_FOLDER,
      resource_type: 'image',
    });

    return {
      secureUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  } catch (error) {
    logger.error({ err: error }, 'Cloudinary upload failed.');
    throw new AppError(
      'Poster upload failed. Check Cloudinary credentials and try again.',
      HTTP_STATUS.SERVICE_UNAVAILABLE,
    );
  }
};

export const deletePosterAsset = async (publicId?: string): Promise<void> => {
  if (!publicId) {
    return;
  }

  assertCloudinaryConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
};

export { cloudinary };
