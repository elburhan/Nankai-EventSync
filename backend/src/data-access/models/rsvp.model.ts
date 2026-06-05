import { Schema, model } from 'mongoose';

import type { HydratedModelDocument, ObjectId } from '../../shared/types/model';

export const RSVP_STATUSES = ['going', 'waitlisted', 'cancelled'] as const;

export type RsvpStatus = (typeof RSVP_STATUSES)[number];

export interface Rsvp {
  _id: ObjectId;
  userId: ObjectId;
  eventId: ObjectId;
  status: RsvpStatus;
  createdAt: Date;
  updatedAt: Date;
}

const rsvpSchema = new Schema<Rsvp>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: RSVP_STATUSES,
      required: true,
      default: 'going',
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

rsvpSchema.index({ userId: 1, eventId: 1 }, { unique: true });
rsvpSchema.index({ eventId: 1, status: 1 });
rsvpSchema.index({ userId: 1, status: 1 });

export type RsvpDocument = HydratedModelDocument<Rsvp>;

export const RsvpModel = model<Rsvp>('Rsvp', rsvpSchema);
