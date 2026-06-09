import { Types } from 'mongoose';

import { EventRepository } from '../../data-access/repositories/event.repository';
import { MessageRepository } from '../../data-access/repositories/message.repository';
import { RsvpRepository } from '../../data-access/repositories/rsvp.repository';
import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import type { AuthenticatedUser } from '../../shared/types/auth';
import { logger } from '../../shared/utils/logger';
import { buildPaginationMeta, resolvePagination } from '../../shared/utils/pagination';
import { deletePosterAsset, uploadPosterAsset } from '../../integration/storage/cloudinary';
import type { CalendarEventQueryDto, EventQueryDto } from '../dto/event-query.dto';
import type { EventResponseDto } from '../dto/event-response.dto';
import type { EventStatus } from '../../shared/constants/event-status';

interface CreateEventInput {
  title: string;
  description: string;
  category: string;
  location: string;
  timezone: string;
  startAt: Date;
  endAt: Date;
  capacity?: number;
  tags?: string[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  posterDataUri?: string;
}

interface UpdateEventInput {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  timezone?: string;
  startAt?: Date;
  endAt?: Date;
  capacity?: number;
  tags?: string[];
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  posterDataUri?: string;
  removePoster?: boolean;
}

interface UpdateEventStatusInput {
  status: EventStatus;
}

const EVENT_MUTATION_FORBIDDEN_MESSAGE = 'You do not have permission to perform this action.';
const EVENT_NOT_FOUND_MESSAGE = 'Event not found.';

export class EventService {
  constructor(
    private readonly eventRepository = new EventRepository(),
    private readonly rsvpRepository = new RsvpRepository(),
    private readonly messageRepository = new MessageRepository(),
  ) {}

  public async createEvent(
    organizer: AuthenticatedUser,
    input: CreateEventInput,
  ): Promise<EventResponseDto> {
    this.assertCreatePermission(organizer);

    let posterAsset:
      | {
          secureUrl: string;
          publicId: string;
        }
      | undefined;

    if (input.posterDataUri) {
      posterAsset = await uploadPosterAsset(input.posterDataUri);
    }

    const event = await this.eventRepository.create({
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
      timezone: input.timezone,
      startAt: input.startAt,
      endAt: input.endAt,
      capacity: input.capacity,
      tags: input.tags ?? [],
      status: input.status,
      attendeeCount: 0,
      organizerId: new Types.ObjectId(organizer.id),
      posterUrl: posterAsset?.secureUrl,
      posterPublicId: posterAsset?.publicId,
    });

    const persistedEvent = await this.eventRepository.findById(event.id);

    if (!persistedEvent) {
      throw new AppError('Created event could not be retrieved.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return this.mapEvent(persistedEvent);
  }

  public async getEvents(query: EventQueryDto) {
    const { page, limit, skip } = resolvePagination(query);
    const filters = this.buildScopedEventFilters(undefined, query);

    const [events, totalItems] = await Promise.all([
      this.eventRepository.findMany(filters, skip, limit),
      this.eventRepository.count(filters),
    ]);

    return {
      items: events.map((event) => this.mapEvent(event)),
      pagination: buildPaginationMeta(page, limit, totalItems),
    };
  }

  public async getEventsForUser(
    authenticatedUser: AuthenticatedUser | undefined,
    query: EventQueryDto,
  ) {
    const { page, limit, skip } = resolvePagination(query);
    const filters = this.buildScopedEventFilters(authenticatedUser, query);

    const [events, totalItems] = await Promise.all([
      this.eventRepository.findMany(filters, skip, limit),
      this.eventRepository.count(filters),
    ]);

    return {
      items: events.map((event) => this.mapEvent(event)),
      pagination: buildPaginationMeta(page, limit, totalItems),
    };
  }

  public async getCalendarEvents(
    authenticatedUser: AuthenticatedUser | undefined,
    query: CalendarEventQueryDto,
  ): Promise<EventResponseDto[]> {
    const filters = this.buildScopedCalendarFilters(authenticatedUser, query);
    const events = await this.eventRepository.findCalendarEvents(filters);
    return events.map((event) => this.mapEvent(event));
  }

  public async getEventById(eventId: string): Promise<EventResponseDto> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new AppError(EVENT_NOT_FOUND_MESSAGE, HTTP_STATUS.NOT_FOUND);
    }

    return this.mapEvent(event);
  }

  public async getEventByIdForUser(
    authenticatedUser: AuthenticatedUser | undefined,
    eventId: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new AppError(EVENT_NOT_FOUND_MESSAGE, HTTP_STATUS.NOT_FOUND);
    }

    const organizerId = this.extractOrganizerId(event.organizerId);

    if (
      !this.canViewEventDetail({
        authenticatedUser,
        organizerId,
        status: event.status,
        startAt: event.startAt,
        visibility: event.visibility,
        isPrivate: event.isPrivate,
        isInternal: event.isInternal,
      })
    ) {
      throw new AppError(EVENT_NOT_FOUND_MESSAGE, HTTP_STATUS.NOT_FOUND);
    }

    return this.mapEvent(event);
  }

  public async updateEvent(
    eventId: string,
    organizer: AuthenticatedUser,
    input: UpdateEventInput,
  ): Promise<EventResponseDto> {
    const existingEvent = await this.eventRepository.findById(eventId);

    if (!existingEvent) {
      throw new AppError('Event not found.', HTTP_STATUS.NOT_FOUND);
    }

    this.assertMutationPermission(this.extractOrganizerId(existingEvent.organizerId), organizer);

    let posterUrl = existingEvent.posterUrl;
    let posterPublicId = existingEvent.posterPublicId;

    if (input.removePoster && existingEvent.posterPublicId) {
      await deletePosterAsset(existingEvent.posterPublicId);
      posterUrl = undefined;
      posterPublicId = undefined;
    }

    if (input.posterDataUri) {
      if (existingEvent.posterPublicId) {
        await deletePosterAsset(existingEvent.posterPublicId);
      }

      const uploadedPoster = await uploadPosterAsset(input.posterDataUri);
      posterUrl = uploadedPoster.secureUrl;
      posterPublicId = uploadedPoster.publicId;
    }

    const startAt = input.startAt ?? existingEvent.startAt;
    const endAt = input.endAt ?? existingEvent.endAt;

    if (endAt <= startAt) {
      throw new AppError('Event end time must be after start time.', HTTP_STATUS.BAD_REQUEST);
    }

    const updatedEvent = await this.eventRepository.updateById(eventId, {
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
      timezone: input.timezone,
      startAt,
      endAt,
      capacity: input.capacity,
      tags: input.tags,
      status: input.status,
      posterUrl,
      posterPublicId,
    });

    if (!updatedEvent) {
      throw new AppError('Event could not be updated.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return this.mapEvent(updatedEvent);
  }

  public async updateEventStatus(
    eventId: string,
    authenticatedUser: AuthenticatedUser,
    input: UpdateEventStatusInput,
  ): Promise<EventResponseDto> {
    const existingEvent = await this.eventRepository.findById(eventId);

    if (!existingEvent) {
      throw new AppError('Event not found.', HTTP_STATUS.NOT_FOUND);
    }

    this.assertMutationPermission(this.extractOrganizerId(existingEvent.organizerId), authenticatedUser);

    const updatedEvent = await this.eventRepository.updateById(eventId, {
      status: input.status,
    });

    if (!updatedEvent) {
      throw new AppError('Event status could not be updated.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    if (authenticatedUser.role === 'admin') {
      logger.info({
        action: 'admin_update_event_status',
        adminUserId: authenticatedUser.id,
        eventId,
        status: input.status,
      }, 'Administrator updated event status.');
    }

    return this.mapEvent(updatedEvent);
  }

  public async deleteEvent(eventId: string, organizer: AuthenticatedUser): Promise<void> {
    const existingEvent = await this.eventRepository.findById(eventId);

    if (!existingEvent) {
      throw new AppError('Event not found.', HTTP_STATUS.NOT_FOUND);
    }

    this.assertMutationPermission(this.extractOrganizerId(existingEvent.organizerId), organizer);

    if (existingEvent.posterPublicId) {
      await deletePosterAsset(existingEvent.posterPublicId);
    }

    await Promise.all([
      this.rsvpRepository.deleteManyByEventId(eventId),
      this.messageRepository.deleteManyByEventId(eventId),
      this.eventRepository.deleteById(eventId),
    ]);

    if (organizer.role === 'admin') {
      logger.info({
        action: 'admin_delete_event',
        adminUserId: organizer.id,
        eventId,
      }, 'Administrator deleted an event.');
    }
  }

  private assertCreatePermission(authenticatedUser: AuthenticatedUser): void {
    if (authenticatedUser.role === 'organizer' || authenticatedUser.role === 'admin') {
      return;
    }

    throw new AppError(EVENT_MUTATION_FORBIDDEN_MESSAGE, HTTP_STATUS.FORBIDDEN);
  }

  private assertMutationPermission(ownerId: string, authenticatedUser: AuthenticatedUser): void {
    if (authenticatedUser.role === 'admin') {
      return;
    }

    if (authenticatedUser.role === 'organizer' && ownerId === authenticatedUser.id) {
      return;
    }

    throw new AppError(EVENT_MUTATION_FORBIDDEN_MESSAGE, HTTP_STATUS.FORBIDDEN);
  }

  private canViewEventDetail({
    authenticatedUser,
    organizerId,
    status,
    startAt,
    visibility,
    isPrivate,
    isInternal,
  }: {
    authenticatedUser: AuthenticatedUser | undefined;
    organizerId: string;
    status: EventStatus;
    startAt: Date;
    visibility?: string;
    isPrivate?: boolean;
    isInternal?: boolean;
  }): boolean {
    if (authenticatedUser?.role === 'admin') {
      return true;
    }

    if (authenticatedUser?.role === 'organizer' && authenticatedUser.id === organizerId) {
      return true;
    }

    return this.isPublicUpcomingEvent({
      status,
      startAt,
      visibility,
      isPrivate,
      isInternal,
    });
  }

  private isPublicUpcomingEvent({
    status,
    startAt,
    visibility,
    isPrivate,
    isInternal,
  }: {
    status: EventStatus;
    startAt: Date;
    visibility?: string;
    isPrivate?: boolean;
    isInternal?: boolean;
  }): boolean {
    const normalizedVisibility = typeof visibility === 'string'
      ? visibility.toLowerCase()
      : 'public';

    return status === 'published'
      && startAt.getTime() >= Date.now()
      && normalizedVisibility === 'public'
      && isPrivate !== true
      && isInternal !== true;
  }

  private buildScopedEventFilters(
    authenticatedUser: AuthenticatedUser | undefined,
    query: Pick<EventQueryDto, 'q' | 'category' | 'status' | 'organizerId' | 'upcoming' | 'from' | 'to'>,
  ) {
    const baseFilters = {
      q: query.q,
      category: query.category,
      status: query.status,
      organizerId: query.organizerId,
      upcoming: query.upcoming,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    };

    if (!authenticatedUser || authenticatedUser.role === 'student') {
      return {
        ...baseFilters,
        status: 'published',
        organizerId: undefined,
        upcoming: true,
      };
    }

    if (authenticatedUser.role === 'organizer') {
      return {
        ...baseFilters,
        organizerId: authenticatedUser.id,
      };
    }

    return baseFilters;
  }

  private buildScopedCalendarFilters(
    authenticatedUser: AuthenticatedUser | undefined,
    query: CalendarEventQueryDto,
  ) {
    const baseFilters = {
      q: query.q,
      status: query.status,
      organizerId: query.organizerId,
      from: new Date(query.from),
      to: new Date(query.to),
    };

    if (!authenticatedUser || authenticatedUser.role === 'student') {
      return {
        ...baseFilters,
        organizerId: undefined,
        status: query.status,
        statusIn: query.status ? undefined : ['published', 'completed', 'cancelled'],
      };
    }

    if (authenticatedUser.role === 'organizer') {
      return {
        ...baseFilters,
        organizerId: authenticatedUser.id,
      };
    }

    return baseFilters;
  }

  private extractOrganizerId(
    organizerId: unknown,
  ): string {
    if (typeof organizerId === 'string') {
      return organizerId;
    }

    if (
      typeof organizerId === 'object' &&
      organizerId !== null &&
      'toString' in organizerId &&
      typeof organizerId.toString === 'function' &&
      !('id' in organizerId)
    ) {
      return organizerId.toString();
    }

    if (typeof organizerId === 'object' && organizerId !== null) {
      const populatedOrganizer = organizerId as {
        id?: string;
        _id?: { toString(): string };
      };

      return populatedOrganizer.id ?? populatedOrganizer._id?.toString() ?? '';
    }

    return '';
  }

  private mapEvent(event: {
    _id: { toString(): string };
    title: string;
    description: string;
    category: string;
    location: string;
    timezone: string;
    startAt: Date;
    endAt: Date;
    posterUrl?: string;
    capacity?: number;
    attendeeCount: number;
    tags: string[];
    status: EventResponseDto['status'];
    visibility?: string;
    isPrivate?: boolean;
    isInternal?: boolean;
    organizerId: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): EventResponseDto {
    const organizer =
      typeof event.organizerId === 'object' && event.organizerId !== null
        ? {
            id: this.extractOrganizerId(event.organizerId),
            fullName:
              'fullName' in event.organizerId && typeof event.organizerId.fullName === 'string'
                ? event.organizerId.fullName
                : 'Unknown Organizer',
            email:
              'email' in event.organizerId && typeof event.organizerId.email === 'string'
                ? event.organizerId.email
                : 'unknown@example.com',
          }
        : {
            id: this.extractOrganizerId(event.organizerId),
            fullName: 'Unknown Organizer',
            email: 'unknown@example.com',
          };

    return {
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location,
      timezone: event.timezone,
      startAt: event.startAt,
      endAt: event.endAt,
      posterUrl: event.posterUrl,
      capacity: event.capacity,
      attendeeCount: event.attendeeCount,
      tags: event.tags,
      status: event.status,
      organizer,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
