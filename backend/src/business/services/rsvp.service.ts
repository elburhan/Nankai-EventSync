import { EventRepository } from '../../data-access/repositories/event.repository';
import { RsvpRepository } from '../../data-access/repositories/rsvp.repository';
import { emitRsvpUpdated } from '../../integration/socket/socket-emitter';
import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import type { AuthenticatedUser } from '../../shared/types/auth';
import type { RsvpResponseDto } from '../dto/rsvp-response.dto';

export class RsvpService {
  constructor(
    private readonly rsvpRepository = new RsvpRepository(),
    private readonly eventRepository = new EventRepository(),
  ) {}

  public async createRsvp(eventId: string, user: AuthenticatedUser): Promise<RsvpResponseDto> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new AppError('Event not found.', HTTP_STATUS.NOT_FOUND);
    }

    await this.rsvpRepository.createOrUpdateGoing(eventId, user.id);

    const attendeeCount = await this.syncAttendeeCount(eventId);

    emitRsvpUpdated(eventId, attendeeCount);

    return {
      eventId,
      attendeeCount,
      status: 'going',
    };
  }

  public async cancelRsvp(eventId: string, user: AuthenticatedUser): Promise<RsvpResponseDto> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new AppError('Event not found.', HTTP_STATUS.NOT_FOUND);
    }

    const existingRsvp = await this.rsvpRepository.findByEventAndUser(eventId, user.id);

    if (!existingRsvp) {
      throw new AppError('RSVP not found for this user and event.', HTTP_STATUS.NOT_FOUND);
    }

    await this.rsvpRepository.deleteByEventAndUser(eventId, user.id);

    const attendeeCount = await this.syncAttendeeCount(eventId);

    emitRsvpUpdated(eventId, attendeeCount);

    return {
      eventId,
      attendeeCount,
      status: 'cancelled',
    };
  }

  private async syncAttendeeCount(eventId: string): Promise<number> {
    const attendeeCount = await this.rsvpRepository.countGoingByEventId(eventId);
    await this.eventRepository.setAttendeeCount(eventId, attendeeCount);
    return attendeeCount;
  }
}
