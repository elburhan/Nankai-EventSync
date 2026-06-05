import { Types } from 'mongoose';

import { EventRoomService } from './event-room.service';
import { MessageRepository } from '../../data-access/repositories/message.repository';
import type { AuthenticatedUser } from '../../shared/types/auth';
import type { MessageResponseDto } from '../dto/message-response.dto';
import { emitMessageCreated } from '../../integration/socket/socket-emitter';

export class MessageService {
  constructor(
    private readonly messageRepository = new MessageRepository(),
    private readonly eventRoomService = new EventRoomService(),
  ) {}

  public async createRoomMessage(
    user: AuthenticatedUser,
    input: { eventId: string; body: string },
  ): Promise<MessageResponseDto> {
    await this.eventRoomService.assertChatAccess(user, input.eventId);

    const message = await this.messageRepository.create({
      eventId: new Types.ObjectId(input.eventId),
      senderId: new Types.ObjectId(user.id),
      senderRole: user.role,
      body: input.body,
      messageType: 'user',
      isEdited: false,
    });

    const populatedMessage = await this.messageRepository.findById(message.id);

    const response = this.mapMessage(populatedMessage ?? message, user, input.eventId);

    emitMessageCreated(input.eventId, response);

    return response;
  }

  private mapMessage(
    message: {
      _id: { toString(): string };
      body: string;
      messageType: MessageResponseDto['messageType'];
      isEdited: boolean;
      createdAt: Date;
      updatedAt: Date;
      senderId?: unknown;
    },
    fallbackUser: AuthenticatedUser,
    eventId: string,
  ): MessageResponseDto {
    const sender = this.extractSender(message.senderId, fallbackUser);

    return {
      id: message._id.toString(),
      eventId,
      sender,
      body: message.body,
      messageType: message.messageType,
      isEdited: message.isEdited,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  private extractSender(
    senderId: unknown,
    fallbackUser: AuthenticatedUser,
  ): MessageResponseDto['sender'] {
    if (
      typeof senderId === 'object' &&
      senderId !== null &&
      !('fullName' in senderId) &&
      'toString' in senderId &&
      typeof senderId.toString === 'function'
    ) {
      return {
        id: senderId.toString(),
        fullName: 'Unknown User',
        role: fallbackUser.role,
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
        id: populatedSender.id ?? populatedSender._id?.toString() ?? fallbackUser.id,
        fullName: populatedSender.fullName ?? 'Unknown User',
        role: populatedSender.role ?? fallbackUser.role,
      };
    }

    return {
      id: fallbackUser.id,
      fullName: 'Unknown User',
      role: fallbackUser.role,
    };
  }
}
