import type { Request, Response } from 'express';

import { RecommendationService } from '../../business/services/recommendation.service';
import { HTTP_STATUS } from '../../shared/constants/http-status';

const recommendationService = new RecommendationService();

export class RecommendationController {
  public async getRecommendations(request: Request, response: Response): Promise<void> {
    const authenticatedUser = request.authenticatedUser;

    if (!authenticatedUser) {
      response.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication is required.',
      });
      return;
    }

    const recommendations = await recommendationService.getRecommendations(
      authenticatedUser,
      request.body.limit,
    );

    response.status(HTTP_STATUS.OK).json({
      success: true,
      data: recommendations,
    });
  }

  public async getHomeFeed(request: Request, response: Response): Promise<void> {
    const authenticatedUser = request.authenticatedUser;

    if (!authenticatedUser) {
      response.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication is required.',
      });
      return;
    }

    const feed = await recommendationService.getHomeFeed(
      authenticatedUser,
      Number(request.query.limit ?? 6),
    );

    response.status(HTTP_STATUS.OK).json({
      success: true,
      data: feed.items,
      meta: feed.meta,
    });
  }
}

export const recommendationController = new RecommendationController();
