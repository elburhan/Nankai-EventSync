import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventService } from '../../src/business/services/event.service';
import type { EventRepository } from '../../src/data-access/repositories/event.repository';
import type { RsvpRepository } from '../../src/data-access/repositories/rsvp.repository';
import type { MessageRepository } from '../../src/data-access/repositories/message.repository';
import { AppError } from '../../src/shared/errors/app-error';
import { HTTP_STATUS } from '../../src/shared/constants/http-status';
import type { AuthenticatedUser } from '../../src/shared/types/auth';

vi.mock('../../src/integration/storage/cloudinary', () => ({
  uploadPosterAsset: vi.fn().mockResolvedValue({ secureUrl: 'url', publicId: 'pid' }),
  deletePosterAsset: vi.fn().mockResolvedValue(undefined),
}));

describe('EventService', () => {
  let eventService: EventService;
  let mockEventRepository: vi.Mocked<EventRepository>;
  let mockRsvpRepository: vi.Mocked<RsvpRepository>;
  let mockMessageRepository: vi.Mocked<MessageRepository>;

  const mockOrganizer: AuthenticatedUser = {
    id: 'user1',
    role: 'organizer',
  };

  const mockAdmin: AuthenticatedUser = {
    id: 'admin1',
    role: 'admin',
  };

  const mockStudent: AuthenticatedUser = {
    id: 'student1',
    role: 'student',
  };

  beforeEach(() => {
    vi.resetAllMocks();

    mockEventRepository = {
      findById: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      updateById: vi.fn(),
      deleteById: vi.fn(),
    } as unknown as vi.Mocked<EventRepository>;

    mockRsvpRepository = {
      deleteManyByEventId: vi.fn(),
    } as unknown as vi.Mocked<RsvpRepository>;

    mockMessageRepository = {
      deleteManyByEventId: vi.fn(),
    } as unknown as vi.Mocked<MessageRepository>;

    eventService = new EventService(mockEventRepository, mockRsvpRepository, mockMessageRepository);
  });

  describe('updateEvent', () => {
    it('should throw error if event not found', async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(
        eventService.updateEvent('event1', mockOrganizer, {})
      ).rejects.toThrow(new AppError('Event not found.', HTTP_STATUS.NOT_FOUND));
    });

    it('should throw forbidden if an organizer tries to update another organizer event', async () => {
      mockEventRepository.findById.mockResolvedValue({
        _id: 'event1',
        organizerId: 'otherUser',
      } as never);

      await expect(
        eventService.updateEvent('event1', mockOrganizer, {})
      ).rejects.toThrow(new AppError('You do not have permission to perform this action.', HTTP_STATUS.FORBIDDEN));
    });

    it('should throw forbidden if a student tries to update an event', async () => {
      mockEventRepository.findById.mockResolvedValue({
        _id: 'event1',
        organizerId: 'user1',
      } as never);

      await expect(
        eventService.updateEvent('event1', mockStudent, {})
      ).rejects.toThrow(new AppError('You do not have permission to perform this action.', HTTP_STATUS.FORBIDDEN));
    });

    it('should update event successfully if user is the organizer', async () => {
      mockEventRepository.findById.mockResolvedValue({
        _id: 'event1',
        organizerId: 'user1',
        startAt: new Date('2025-01-01'),
        endAt: new Date('2025-01-02'),
      } as never);

      mockEventRepository.updateById.mockResolvedValue({
        _id: 'event1',
        organizerId: 'user1',
        title: 'New Title',
        toString: () => 'event1',
      } as never);

      const result = await eventService.updateEvent('event1', mockOrganizer, { title: 'New Title' });

      expect(mockEventRepository.updateById).toHaveBeenCalledWith('event1', expect.objectContaining({
        title: 'New Title',
      }));
      expect(result.title).toBe('New Title');
    });

    it('should allow admin to update any event', async () => {
      mockEventRepository.findById.mockResolvedValue({
        _id: 'event1',
        organizerId: 'otherUser',
        startAt: new Date('2025-01-01'),
        endAt: new Date('2025-01-02'),
      } as never);

      mockEventRepository.updateById.mockResolvedValue({
        _id: 'event1',
        organizerId: 'otherUser',
        title: 'Admin Title',
        description: 'Event description',
        category: 'Academic',
        location: 'Main Hall',
        timezone: 'Asia/Shanghai',
        startAt: new Date('2025-01-01'),
        endAt: new Date('2025-01-02'),
        attendeeCount: 0,
        tags: [],
        status: 'published',
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-02T10:00:00.000Z'),
      } as never);

      const result = await eventService.updateEvent('event1', mockAdmin, { title: 'Admin Title' });

      expect(mockEventRepository.updateById).toHaveBeenCalledWith('event1', expect.objectContaining({
        title: 'Admin Title',
      }));
      expect(result.title).toBe('Admin Title');
    });
  });

  describe('updateEventStatus', () => {
    it('should throw error if the event does not exist', async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(
        eventService.updateEventStatus('event1', mockAdmin, { status: 'published' }),
      ).rejects.toThrow(new AppError('Event not found.', HTTP_STATUS.NOT_FOUND));
    });

    it('should allow admin to update status regardless of ownership', async () => {
      mockEventRepository.findById.mockResolvedValue({
        _id: 'event1',
        organizerId: 'otherUser',
      } as never);

      mockEventRepository.updateById.mockResolvedValue({
        _id: 'event1',
        title: 'Admin Updated Event',
        description: 'Event description',
        category: 'Academic',
        location: 'Main Hall',
        timezone: 'Asia/Shanghai',
        startAt: new Date('2026-01-01T10:00:00.000Z'),
        endAt: new Date('2026-01-01T12:00:00.000Z'),
        attendeeCount: 0,
        tags: [],
        status: 'cancelled',
        organizerId: 'otherUser',
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-02T10:00:00.000Z'),
      } as never);

      const result = await eventService.updateEventStatus('event1', mockAdmin, { status: 'cancelled' });

      expect(mockEventRepository.updateById).toHaveBeenCalledWith('event1', { status: 'cancelled' });
      expect(result.status).toBe('cancelled');
    });

    it('should block non-owner users from updating status', async () => {
      mockEventRepository.findById.mockResolvedValue({
        _id: 'event1',
        organizerId: 'otherUser',
      } as never);

      await expect(
        eventService.updateEventStatus('event1', mockOrganizer, { status: 'published' }),
      ).rejects.toThrow(new AppError('You do not have permission to perform this action.', HTTP_STATUS.FORBIDDEN));
    });

    it('should block students from updating status', async () => {
      mockEventRepository.findById.mockResolvedValue({
        _id: 'event1',
        organizerId: 'user1',
      } as never);

      await expect(
        eventService.updateEventStatus('event1', mockStudent, { status: 'published' }),
      ).rejects.toThrow(new AppError('You do not have permission to perform this action.', HTTP_STATUS.FORBIDDEN));
    });
  });

  describe('deleteEvent', () => {
    it('should allow admin to delete event regardless of ownership', async () => {
      mockEventRepository.findById.mockResolvedValue({
        _id: 'event1',
        organizerId: 'user1', // Not the admin
      } as never);

      await eventService.deleteEvent('event1', mockAdmin);

      expect(mockRsvpRepository.deleteManyByEventId).toHaveBeenCalledWith('event1');
      expect(mockMessageRepository.deleteManyByEventId).toHaveBeenCalledWith('event1');
      expect(mockEventRepository.deleteById).toHaveBeenCalledWith('event1');
    });

    it('should throw forbidden if an organizer tries to delete another organizer event', async () => {
      mockEventRepository.findById.mockResolvedValue({
        _id: 'event1',
        organizerId: 'otherUser',
      } as never);

      await expect(
        eventService.deleteEvent('event1', mockOrganizer)
      ).rejects.toThrow(new AppError('You do not have permission to perform this action.', HTTP_STATUS.FORBIDDEN));
      
      expect(mockEventRepository.deleteById).not.toHaveBeenCalled();
    });

    it('should allow organizer to delete their own event', async () => {
      mockEventRepository.findById.mockResolvedValue({
        _id: 'event1',
        organizerId: 'user1',
      } as never);

      await eventService.deleteEvent('event1', mockOrganizer);

      expect(mockEventRepository.deleteById).toHaveBeenCalledWith('event1');
    });

    it('should reject students trying to delete an event', async () => {
      mockEventRepository.findById.mockResolvedValue({
        _id: 'event1',
        organizerId: 'user1',
      } as never);

      await expect(
        eventService.deleteEvent('event1', mockStudent),
      ).rejects.toThrow(new AppError('You do not have permission to perform this action.', HTTP_STATUS.FORBIDDEN));

      expect(mockEventRepository.deleteById).not.toHaveBeenCalled();
    });
  });
});
