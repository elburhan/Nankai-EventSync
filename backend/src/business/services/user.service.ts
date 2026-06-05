import { EventRepository } from '../../data-access/repositories/event.repository';
import { MessageRepository } from '../../data-access/repositories/message.repository';
import { RsvpRepository } from '../../data-access/repositories/rsvp.repository';
import { UserRepository } from '../../data-access/repositories/user.repository';
import { deletePosterAsset } from '../../integration/storage/cloudinary';
import { disconnectSocketsForUser } from '../../integration/socket/socket-server';
import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import type { AuthenticatedUser } from '../../shared/types/auth';
import { logger } from '../../shared/utils/logger';
import type { DeleteAccountResponseDto } from '../dto/auth-response.dto';

export class UserService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly eventRepository = new EventRepository(),
    private readonly rsvpRepository = new RsvpRepository(),
    private readonly messageRepository = new MessageRepository(),
  ) {}

  public async deleteAuthenticatedUser(
    authenticatedUser: AuthenticatedUser,
  ): Promise<DeleteAccountResponseDto> {
    const user = await this.userRepository.findById(authenticatedUser.id);

    if (!user) {
      throw new AppError('User account not found.', HTTP_STATUS.NOT_FOUND);
    }

    const organizerEvents =
      authenticatedUser.role === 'organizer' || authenticatedUser.role === 'admin'
        ? await this.eventRepository.findByOrganizerId(authenticatedUser.id)
        : [];

    const organizerEventIds = new Set(organizerEvents.map((event) => event._id.toString()));
    const userGoingRsvps = await this.rsvpRepository.findGoingByUserId(authenticatedUser.id);
    const affectedRemainingEventIds = Array.from(
      new Set(
        userGoingRsvps
          .map((rsvp) => rsvp.eventId.toString())
          .filter((eventId) => !organizerEventIds.has(eventId)),
      ),
    );

    let deletedOwnedEventCount = 0;
    let deletedRsvpCount = 0;
    let deletedMessageCount = 0;

    for (const event of organizerEvents) {
      if (event.posterPublicId) {
        await deletePosterAsset(event.posterPublicId);
      }

      const eventId = event._id.toString();
      const [deletedEventRsvps, deletedEventMessages] = await Promise.all([
        this.rsvpRepository.deleteManyByEventId(eventId),
        this.messageRepository.deleteManyByEventId(eventId),
      ]);

      deletedRsvpCount += deletedEventRsvps.deletedCount ?? 0;
      deletedMessageCount += deletedEventMessages.deletedCount ?? 0;

      await this.eventRepository.deleteById(eventId);
      deletedOwnedEventCount += 1;
    }

    const [deletedUserRsvps, deletedUserMessages] = await Promise.all([
      this.rsvpRepository.deleteManyByUserId(authenticatedUser.id),
      this.messageRepository.deleteManyBySenderId(authenticatedUser.id),
    ]);

    deletedRsvpCount += deletedUserRsvps.deletedCount ?? 0;
    deletedMessageCount += deletedUserMessages.deletedCount ?? 0;

    for (const eventId of affectedRemainingEventIds) {
      const event = await this.eventRepository.findById(eventId);

      if (!event) {
        continue;
      }

      const attendeeCount = await this.rsvpRepository.countGoingByEventId(eventId);
      await this.eventRepository.setAttendeeCount(eventId, attendeeCount);
    }

    const deletedUser = await this.userRepository.deleteById(authenticatedUser.id);

    if (!deletedUser) {
      throw new AppError('User account could not be deleted.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    disconnectSocketsForUser(authenticatedUser.id);

    logger.info(
      `User account deleted: ${authenticatedUser.id} (role=${authenticatedUser.role}, ownedEvents=${deletedOwnedEventCount}, rsvps=${deletedRsvpCount}, messages=${deletedMessageCount})`,
    );

    return {
      deletedUserId: authenticatedUser.id,
      deletedOwnedEventCount,
      deletedRsvpCount,
      deletedMessageCount,
    };
  }
}
