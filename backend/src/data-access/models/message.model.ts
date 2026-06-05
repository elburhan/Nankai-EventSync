import { Schema, model } from 'mongoose';

import { USER_ROLES } from '../../shared/constants/user-role';
import type { HydratedModelDocument, ObjectId } from '../../shared/types/model';

export const MESSAGE_TYPES = ['user', 'system'] as const;

export type MessageType = (typeof MESSAGE_TYPES)[number];

export interface Message {
  _id: ObjectId;
  eventId: ObjectId;
  senderId: ObjectId;
  senderRole: (typeof USER_ROLES)[number];
  body: string;
  messageType: MessageType;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<Message>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: USER_ROLES,
      required: true,
      index: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    messageType: {
      type: String,
      enum: MESSAGE_TYPES,
      default: 'user',
      required: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

messageSchema.index({ eventId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1, createdAt: -1 });

export type MessageDocument = HydratedModelDocument<Message>;

export const MessageModel = model<Message>('Message', messageSchema);
