import type { Request, Response } from 'express';

import { RsvpService } from '../../business/services/rsvp.service';
import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';

const rsvpService = new RsvpService();

export class RsvpController {
  public async createRsvp(request: Request, response: Response): Promise<void> {
    if (!request.authenticatedUser) {
      throw new AppError('Authentication is required.', HTTP_STATUS.UNAUTHORIZED);
    }

    const result = await rsvpService.createRsvp(request.params.eventId, request.authenticatedUser);

    response.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'RSVP created successfully.',
      data: result,
    });
  }

  public async cancelRsvp(request: Request, response: Response): Promise<void> {
    if (!request.authenticatedUser) {
      throw new AppError('Authentication is required.', HTTP_STATUS.UNAUTHORIZED);
    }

    const result = await rsvpService.cancelRsvp(request.params.eventId, request.authenticatedUser);

    response.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'RSVP cancelled successfully.',
      data: result,
    });
  }
}

export const rsvpController = new RsvpController();
