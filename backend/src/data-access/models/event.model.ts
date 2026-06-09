import { Schema, model } from 'mongoose';

import { EVENT_STATUSES, type EventStatus } from '../../shared/constants/event-status';
import type { HydratedModelDocument, ObjectId } from '../../shared/types/model';

export interface Event {
  _id: ObjectId;
  title: string;
  description: string;
  category: string;
  location: string;
  timezone: string;
  startAt: Date;
  endAt: Date;
  posterUrl?: string;
  posterPublicId?: string;
  capacity?: number;
  attendeeCount: number;
  tags: string[];
  status: EventStatus;
  visibility: 'public' | 'private' | 'internal';
  isPrivate?: boolean;
  isInternal?: boolean;
  organizerId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<Event>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    timezone: {
      type: String,
      required: true,
      default: 'Asia/Shanghai',
      trim: true,
    },
    startAt: {
      type: Date,
      required: true,
      index: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
    posterUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
    },
    posterPublicId: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    capacity: {
      type: Number,
      min: 1,
    },
    attendeeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: EVENT_STATUSES,
      default: 'draft',
      required: true,
      index: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'internal'],
      default: 'public',
      required: true,
      index: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
      index: true,
    },
    isInternal: {
      type: Boolean,
      default: false,
      index: true,
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

eventSchema.index({ organizerId: 1, startAt: 1 });
eventSchema.index({ category: 1, startAt: 1 });
eventSchema.index({ status: 1, startAt: 1 });
eventSchema.index({ status: 1, category: 1, startAt: 1 });
eventSchema.index({ title: 'text', description: 'text', location: 'text' });

export type EventDocument = HydratedModelDocument<Event>;

export const EventModel = model<Event>('Event', eventSchema);
