import { EventRepository } from '../../data-access/repositories/event.repository';
import { MessageRepository } from '../../data-access/repositories/message.repository';
import { RsvpRepository } from '../../data-access/repositories/rsvp.repository';
import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import type { AuthenticatedUser } from '../../shared/types/auth';
import type { EventRoomStateDto } from '../dto/event-room-state.dto';
import type { MessageResponseDto } from '../dto/message-response.dto';

export class EventRoomService {
  constructor(
    private readonly eventRepository = new EventRepository(),
    private readonly rsvpRepository = new RsvpRepository(),
    private readonly messageRepository = new MessageRepository(),
  ) {}

  public async getRoomState(
    user: AuthenticatedUser,
    eventId: string,
  ): Promise<EventRoomStateDto> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new AppError('Event not found.', HTTP_STATUS.NOT_FOUND);
    }

    const organizerId = this.extractOrganizerId(event.organizerId);
    const participantState = await this.getParticipantState(user, eventId, organizerId);

    const messages = await this.messageRepository.findRecentByEvent(eventId, 50);

    return {
      eventId,
      attendeeCount: event.attendeeCount,
      isAttending: participantState.isAttending,
      canChat: participantState.canChat,
      messages: messages.map((message) => this.mapMessage(message)).reverse(),
    };
  }

  public async assertChatAccess(
    user: AuthenticatedUser,
    eventId: string,
    organizerId?: string,
  ): Promise<void> {
    const participantState = await this.getParticipantState(
      user,
      eventId,
      organizerId,
    );

    if (!participantState.canChat) {
      throw new AppError(
        'You must RSVP, host this event, or be an admin to send messages in this event room.',
        HTTP_STATUS.FORBIDDEN,
      );
    }
  }

  private async getParticipantState(
    user: AuthenticatedUser,
    eventId: string,
    organizerId?: string,
  ): Promise<{ isAttending: boolean; canChat: boolean }> {
    const resolvedOrganizerId =
      organizerId ??
      (await this.resolveOrganizerId(eventId));

    const hasPrivilegedChatAccess = user.role === 'admin' || resolvedOrganizerId === user.id;

    if (hasPrivilegedChatAccess) {
      return {
        isAttending: false,
        canChat: true,
      };
    }

    const hasActiveRsvp = await this.rsvpRepository.hasGoingRsvp(eventId, user.id);

    return {
      isAttending: hasActiveRsvp,
      canChat: hasActiveRsvp,
    };
  }

  private async resolveOrganizerId(eventId: string): Promise<string> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new AppError('Event not found.', HTTP_STATUS.NOT_FOUND);
    }

    return this.extractOrganizerId(event.organizerId);
  }

  private extractOrganizerId(organizerId: unknown): string {
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

  private mapMessage(message: {
    _id: { toString(): string };
    eventId: { toString(): string } | string;
    senderId: unknown;
    body: string;
    messageType: MessageResponseDto['messageType'];
    isEdited: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): MessageResponseDto {
    const sender = this.extractSender(message.senderId);

    return {
      id: message._id.toString(),
      eventId: typeof message.eventId === 'string' ? message.eventId : message.eventId.toString(),
      sender,
      body: message.body,
      messageType: message.messageType,
      isEdited: message.isEdited,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  private extractSender(senderId: unknown): MessageResponseDto['sender'] {
    if (typeof senderId === 'string') {
      return {
        id: senderId,
        fullName: 'Unknown User',
        role: 'student',
      };
    }

    if (
      typeof senderId === 'object' &&
      senderId !== null &&
      'toString' in senderId &&
      typeof senderId.toString === 'function' &&
      !('fullName' in senderId)
    ) {
      return {
        id: senderId.toString(),
        fullName: 'Unknown User',
        role: 'student',
      };
    }

    if (typeof senderId === 'object' && senderId !== null) {
      const populatedSender = senderId as {
        id?: string;
        _id?: { toString(): string };
        fullName?: string;
        role?: MessageResponseDto['sender']['role'];
      };

      return {
        id: populatedSender.id ?? populatedSender._id?.toString() ?? '',
        fullName: populatedSender.fullName ?? 'Unknown User',
        role: populatedSender.role ?? 'student',
      };
    }

    return {
      id: '',
      fullName: 'Unknown User',
      role: 'student',
    };
  }
}
