import type { Request, Response } from 'express';

import { EventService } from '../../business/services/event.service';
import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import type { CalendarEventQueryDto, EventQueryDto } from '../../business/dto/event-query.dto';

const eventService = new EventService();

export class EventController {
  public async createEvent(request: Request, response: Response): Promise<void> {
    if (!request.authenticatedUser) {
      throw new AppError('Authentication is required.', HTTP_STATUS.UNAUTHORIZED);
    }

    const event = await eventService.createEvent(request.authenticatedUser, request.body);

    response.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Event created successfully.',
      data: event,
    });
  }

  public async getEvents(request: Request, response: Response): Promise<void> {
    const result = await eventService.getEventsForUser(
      request.authenticatedUser,
      request.query as unknown as EventQueryDto,
    );

    response.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  }

  public async getCalendarEvents(request: Request, response: Response): Promise<void> {
    const events = await eventService.getCalendarEvents(
      request.authenticatedUser,
      request.query as unknown as CalendarEventQueryDto,
    );

    response.status(HTTP_STATUS.OK).json({
      success: true,
      data: events,
    });
  }

  public async getEventById(request: Request, response: Response): Promise<void> {
    const event = await eventService.getEventByIdForUser(
      request.authenticatedUser,
      request.params.eventId,
    );

    response.status(HTTP_STATUS.OK).json({
      success: true,
      data: event,
    });
  }

  public async updateEvent(request: Request, response: Response): Promise<void> {
    if (!request.authenticatedUser) {
      throw new AppError('Authentication is required.', HTTP_STATUS.UNAUTHORIZED);
    }

    const event = await eventService.updateEvent(
      request.params.eventId,
      request.authenticatedUser,
      request.body,
    );

    response.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Event updated successfully.',
      data: event,
    });
  }

  public async updateEventStatus(request: Request, response: Response): Promise<void> {
    if (!request.authenticatedUser) {
      throw new AppError('Authentication is required.', HTTP_STATUS.UNAUTHORIZED);
    }

    const event = await eventService.updateEventStatus(
      request.params.eventId,
      request.authenticatedUser,
      request.body,
    );

    response.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Event status updated successfully.',
      data: event,
    });
  }

  public async deleteEvent(request: Request, response: Response): Promise<void> {
    if (!request.authenticatedUser) {
      throw new AppError('Authentication is required.', HTTP_STATUS.UNAUTHORIZED);
    }

    await eventService.deleteEvent(request.params.eventId, request.authenticatedUser);

    response.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Event deleted successfully.',
    });
  }
}

export const eventController = new EventController();
