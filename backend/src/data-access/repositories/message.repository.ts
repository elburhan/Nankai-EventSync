import { MessageModel, type Message, type MessageDocument } from '../models/message.model';

export class MessageRepository {
  public create(data: Partial<Message>): Promise<MessageDocument> {
    return MessageModel.create(data);
  }

  public findById(messageId: string): Promise<MessageDocument | null> {
    return MessageModel.findById(messageId)
      .populate('senderId', 'fullName role')
      .exec();
  }

  public findByEvent(eventId: string): Promise<MessageDocument[]> {
    return MessageModel.find({ eventId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'fullName role')
      .exec();
  }

  public findRecentByEvent(eventId: string, limit: number): Promise<MessageDocument[]> {
    return MessageModel.find({ eventId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('senderId', 'fullName role')
      .exec();
  }

  public deleteManyByEventId(eventId: string): Promise<{ deletedCount?: number }> {
    return MessageModel.deleteMany({ eventId }).exec();
  }

  public deleteManyBySenderId(senderId: string): Promise<{ deletedCount?: number }> {
    return MessageModel.deleteMany({ senderId }).exec();
  }
}
