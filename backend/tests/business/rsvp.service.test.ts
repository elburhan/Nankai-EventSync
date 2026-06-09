import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RsvpService } from '../../src/business/services/rsvp.service';
import type { EventRepository } from '../../src/data-access/repositories/event.repository';
import type { RsvpRepository } from '../../src/data-access/repositories/rsvp.repository';
import { HTTP_STATUS } from '../../src/shared/constants/http-status';
import { AppError } from '../../src/shared/errors/app-error';
import type { AuthenticatedUser } from '../../src/shared/types/auth';

vi.mock('../../src/integration/socket/socket-emitter', () => ({
  emitRsvpUpdated: vi.fn(),
}));

describe('RsvpService', () => {
  let rsvpService: RsvpService;
  let mockRsvpRepository: vi.Mocked<RsvpRepository>;
  let mockEventRepository: vi.Mocked<EventRepository>;

  const eventId = '665000000000000000000001';
  const student: AuthenticatedUser = {
    id: '665000000000000000000002',
    role: 'student',
  };

  const buildEvent = (overrides: Record<string, unknown> = {}) => ({
    _id: { toString: () => eventId },
    status: 'published',
    startAt: new Date('2099-01-01T10:00:00.000Z'),
    attendeeCount: 1,
    capacity: 10,
    ...overrides,
  });

  beforeEach(() => {
    vi.resetAllMocks();

    mockRsvpRepository = {
      findByEventAndUser: vi.fn(),
      createOrUpdateGoing: vi.fn(),
      countGoingByEventId: vi.fn(),
      deleteByEventAndUser: vi.fn(),
    } as unknown as vi.Mocked<RsvpRepository>;

    mockEventRepository = {
      findById: vi.fn(),
      setAttendeeCount: vi.fn(),
    } as unknown as vi.Mocked<EventRepository>;

    rsvpService = new RsvpService(mockRsvpRepository, mockEventRepository);
    mockRsvpRepository.createOrUpdateGoing.mockResolvedValue({} as never);
    mockRsvpRepository.countGoingByEventId.mockResolvedValue(2);
  });

  it('creates RSVP for published upcoming events with available capacity', async () => {
    mockEventRepository.findById.mockResolvedValue(buildEvent() as never);
    mockRsvpRepository.findByEventAndUser.mockResolvedValue(null);

    const result = await rsvpService.createRsvp(eventId, student);

    expect(mockRsvpRepository.createOrUpdateGoing).toHaveBeenCalledWith(eventId, student.id);
    expect(mockEventRepository.setAttendeeCount).toHaveBeenCalledWith(eventId, 2);
    expect(result).toEqual({
      eventId,
      attendeeCount: 2,
      status: 'going',
    });
  });

  it('rejects RSVP for draft events', async () => {
    mockEventRepository.findById.mockResolvedValue(buildEvent({ status: 'draft' }) as never);

    await expect(rsvpService.createRsvp(eventId, student)).rejects.toThrow(
      new AppError('RSVP is only available for published events.', HTTP_STATUS.BAD_REQUEST),
    );

    expect(mockRsvpRepository.createOrUpdateGoing).not.toHaveBeenCalled();
  });

  it('rejects RSVP for past events', async () => {
    mockEventRepository.findById.mockResolvedValue(buildEvent({
      startAt: new Date('2020-01-01T10:00:00.000Z'),
    }) as never);

    await expect(rsvpService.createRsvp(eventId, student)).rejects.toThrow(
      new AppError('RSVP is closed for past events.', HTTP_STATUS.BAD_REQUEST),
    );

    expect(mockRsvpRepository.createOrUpdateGoing).not.toHaveBeenCalled();
  });

  it('rejects RSVP when the event is already full', async () => {
    mockEventRepository.findById.mockResolvedValue(buildEvent({
      attendeeCount: 10,
      capacity: 10,
    }) as never);
    mockRsvpRepository.findByEventAndUser.mockResolvedValue(null);

    await expect(rsvpService.createRsvp(eventId, student)).rejects.toThrow(
      new AppError('This event is already at full capacity.', HTTP_STATUS.CONFLICT),
    );

    expect(mockRsvpRepository.createOrUpdateGoing).not.toHaveBeenCalled();
  });

  it('keeps an existing RSVP idempotent even when the event is at capacity', async () => {
    mockEventRepository.findById.mockResolvedValue(buildEvent({
      attendeeCount: 10,
      capacity: 10,
    }) as never);
    mockRsvpRepository.findByEventAndUser.mockResolvedValue({ status: 'going' } as never);

    const result = await rsvpService.createRsvp(eventId, student);

    expect(mockRsvpRepository.createOrUpdateGoing).not.toHaveBeenCalled();
    expect(result).toEqual({
      eventId,
      attendeeCount: 10,
      status: 'going',
    });
  });
});
