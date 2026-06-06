import { describe, expect, it, beforeEach, vi } from 'vitest';

import { EventRoomService } from '../../src/business/services/event-room.service';
import { MessageService } from '../../src/business/services/message.service';
import type { EventRepository } from '../../src/data-access/repositories/event.repository';
import type { MessageRepository } from '../../src/data-access/repositories/message.repository';
import type { RsvpRepository } from '../../src/data-access/repositories/rsvp.repository';
import { HTTP_STATUS } from '../../src/shared/constants/http-status';
import { AppError } from '../../src/shared/errors/app-error';
import type { AuthenticatedUser } from '../../src/shared/types/auth';

vi.mock('../../src/integration/socket/socket-emitter', () => ({
  emitMessageCreated: vi.fn(),
}));

describe('MessageService', () => {
  let messageService: MessageService;
  let mockEventRepository: vi.Mocked<EventRepository>;
  let mockRsvpRepository: vi.Mocked<RsvpRepository>;
  let mockMessageRepository: vi.Mocked<MessageRepository>;

  const eventId = '665000000000000000000001';
  const organizerId = '665000000000000000000002';
  const attendeeId = '665000000000000000000003';
  const adminId = '665000000000000000000004';
  const unrelatedStudentId = '665000000000000000000005';
  const messageId = '665000000000000000000006';

  const buildUser = (id: string, role: AuthenticatedUser['role']): AuthenticatedUser => ({
    id,
    role,
  });

  const mockEvent = {
    _id: eventId,
    organizerId,
    attendeeCount: 1,
  };

  const mockMessage = {
    id: messageId,
    _id: { toString: () => messageId },
    body: 'Hello event room',
    messageType: 'user',
    isEdited: false,
    createdAt: new Date('2026-01-01T10:00:00.000Z'),
    updatedAt: new Date('2026-01-01T10:00:00.000Z'),
  };

  beforeEach(() => {
    vi.resetAllMocks();

    mockEventRepository = {
      findById: vi.fn(),
    } as unknown as vi.Mocked<EventRepository>;

    mockRsvpRepository = {
      hasGoingRsvp: vi.fn(),
    } as unknown as vi.Mocked<RsvpRepository>;

    mockMessageRepository = {
      create: vi.fn(),
      findById: vi.fn(),
    } as unknown as vi.Mocked<MessageRepository>;

    const eventRoomService = new EventRoomService(
      mockEventRepository,
      mockRsvpRepository,
      mockMessageRepository,
    );

    messageService = new MessageService(mockMessageRepository, eventRoomService);
    mockEventRepository.findById.mockResolvedValue(mockEvent as never);
    mockMessageRepository.create.mockResolvedValue(mockMessage as never);
    mockMessageRepository.findById.mockResolvedValue(null);
  });

  it('allows an RSVP attendee to send a message', async () => {
    mockRsvpRepository.hasGoingRsvp.mockResolvedValue(true);

    const result = await messageService.createRoomMessage(
      buildUser(attendeeId, 'student'),
      { eventId, body: 'Hello event room' },
    );

    expect(mockMessageRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'Hello event room',
        senderRole: 'student',
      }),
    );
    expect(result.body).toBe('Hello event room');
  });

  it('rejects a non-RSVP student from sending a message', async () => {
    mockRsvpRepository.hasGoingRsvp.mockResolvedValue(false);

    await expect(
      messageService.createRoomMessage(
        buildUser(unrelatedStudentId, 'student'),
        { eventId, body: 'Hello event room' },
      ),
    ).rejects.toThrow(
      new AppError(
        'You must RSVP, host this event, or be an admin to send messages in this event room.',
        HTTP_STATUS.FORBIDDEN,
      ),
    );

    expect(mockMessageRepository.create).not.toHaveBeenCalled();
  });

  it('allows the event organizer to send a message without RSVP', async () => {
    const result = await messageService.createRoomMessage(
      buildUser(organizerId, 'organizer'),
      { eventId, body: 'Host update' },
    );

    expect(mockRsvpRepository.hasGoingRsvp).not.toHaveBeenCalled();
    expect(mockMessageRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'Host update',
        senderRole: 'organizer',
      }),
    );
    expect(result.body).toBe('Hello event room');
  });

  it('allows an admin to send a message without RSVP', async () => {
    const result = await messageService.createRoomMessage(
      buildUser(adminId, 'admin'),
      { eventId, body: 'Admin update' },
    );

    expect(mockRsvpRepository.hasGoingRsvp).not.toHaveBeenCalled();
    expect(mockMessageRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'Admin update',
        senderRole: 'admin',
      }),
    );
    expect(result.body).toBe('Hello event room');
  });
});
