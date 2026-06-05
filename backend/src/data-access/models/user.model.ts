import { Schema, model } from 'mongoose';

import { USER_ROLES, type UserRole } from '../../shared/constants/user-role';
import type { HydratedModelDocument, ObjectId } from '../../shared/types/model';

export interface User {
  _id: ObjectId;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  emailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpiresAt?: Date;
  avatarUrl?: string;
  bio?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 60,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'student',
      required: true,
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
      required: true,
      index: true,
    },
    emailVerificationCode: {
      type: String,
      trim: true,
      select: false,
    },
    emailVerificationExpiresAt: {
      type: Date,
      select: false,
    },
    avatarUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ role: 1, isActive: 1 });

export type UserDocument = HydratedModelDocument<User>;

export const UserModel = model<User>('User', userSchema);
